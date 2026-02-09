import { describe, it, expect } from 'vitest';
import { hashSkill } from '../version-hasher.js';

describe('hashSkill', () => {
  describe('deterministic hashing', () => {
    it('produces the same hash for identical inputs', () => {
      const skillMd = '# Test Skill\n\nGET /api/users';
      const apiTs = 'GET /api/users\nPOST /api/users';

      const hash1 = hashSkill(skillMd, apiTs);
      const hash2 = hashSkill(skillMd, apiTs);

      expect(hash1).toBe(hash2);
    });

    it('produces consistent hashes across multiple calls', () => {
      const skillMd = '# Weather API\n\nGET /weather?city={city}';
      const apiTs = 'GET /weather\nGET /forecast';

      const hashes = [];
      for (let i = 0; i < 10; i++) {
        hashes.push(hashSkill(skillMd, apiTs));
      }

      const firstHash = hashes[0];
      expect(hashes.every(h => h === firstHash)).toBe(true);
    });

    it('handles empty strings consistently', () => {
      const hash1 = hashSkill('', '');
      const hash2 = hashSkill('', '');

      expect(hash1).toBe(hash2);
      expect(hash1).toBeTruthy();
    });

    it('handles whitespace-only content consistently', () => {
      const hash1 = hashSkill('   ', '   ');
      const hash2 = hashSkill('   ', '   ');

      expect(hash1).toBe(hash2);
    });

    it('handles unicode content consistently', () => {
      const skillMd = '# API 🚀\n\n使用方法';
      const apiTs = 'GET /データ';

      const hash1 = hashSkill(skillMd, apiTs);
      const hash2 = hashSkill(skillMd, apiTs);

      expect(hash1).toBe(hash2);
    });

    it('handles multiline content consistently', () => {
      const skillMd = `# Multi-line Skill

This is a longer skill description
with multiple lines
and various content.

## Endpoints

GET /api/v1/users
POST /api/v1/users
DELETE /api/v1/users/:id
`;
      const apiTs = 'GET /api/v1/users\nPOST /api/v1/users\nDELETE /api/v1/users/{id}';

      const hash1 = hashSkill(skillMd, apiTs);
      const hash2 = hashSkill(skillMd, apiTs);

      expect(hash1).toBe(hash2);
    });
  });

  describe('different inputs produce different hashes', () => {
    it('produces different hashes for different skillMd', () => {
      const apiTs = 'GET /api/users';
      
      const hash1 = hashSkill('# Skill A', apiTs);
      const hash2 = hashSkill('# Skill B', apiTs);

      expect(hash1).not.toBe(hash2);
    });

    it('produces different hashes for different apiTs', () => {
      const skillMd = '# Test Skill';
      
      const hash1 = hashSkill(skillMd, 'GET /api/users');
      const hash2 = hashSkill(skillMd, 'POST /api/users');

      expect(hash1).not.toBe(hash2);
    });

    it('produces different hashes when both inputs differ', () => {
      const hash1 = hashSkill('# Skill A', 'GET /api/users');
      const hash2 = hashSkill('# Skill B', 'POST /api/data');

      expect(hash1).not.toBe(hash2);
    });

    it('is sensitive to whitespace differences', () => {
      const apiTs = 'GET /api/users';
      
      const hash1 = hashSkill('# Skill', apiTs);
      const hash2 = hashSkill('#  Skill', apiTs); // extra space

      expect(hash1).not.toBe(hash2);
    });

    it('is sensitive to newline differences', () => {
      const apiTs = 'GET /api/users';
      
      const hash1 = hashSkill('# Skill\n', apiTs);
      const hash2 = hashSkill('# Skill\n\n', apiTs);

      expect(hash1).not.toBe(hash2);
    });

    it('is sensitive to case differences', () => {
      const apiTs = 'GET /api/users';
      
      const hash1 = hashSkill('# Skill', apiTs);
      const hash2 = hashSkill('# skill', apiTs);

      expect(hash1).not.toBe(hash2);
    });

    it('produces different hashes for reordered content', () => {
      const hash1 = hashSkill('GET /users\nPOST /users', 'API v1');
      const hash2 = hashSkill('POST /users\nGET /users', 'API v1');

      expect(hash1).not.toBe(hash2);
    });

    it('produces different hashes for added content', () => {
      const apiTs = 'GET /api/users';
      
      const hash1 = hashSkill('# Skill', apiTs);
      const hash2 = hashSkill('# Skill\nExtra content', apiTs);

      expect(hash1).not.toBe(hash2);
    });

    it('produces different hashes for removed content', () => {
      const apiTs = 'GET /api/users';
      
      const hash1 = hashSkill('# Skill\nWith description', apiTs);
      const hash2 = hashSkill('# Skill', apiTs);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('hash format validation', () => {
    it('returns a valid hexadecimal string', () => {
      const hash = hashSkill('# Test', 'GET /api');
      
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('returns a 64-character hash (SHA-256)', () => {
      const hash = hashSkill('# Test', 'GET /api');
      
      expect(hash).toHaveLength(64);
    });

    it('returns lowercase hex characters', () => {
      const hash = hashSkill('# TEST', 'GET /API');
      
      expect(hash).toBe(hash.toLowerCase());
      expect(hash).not.toMatch(/[A-F]/);
    });

    it('never returns empty hash', () => {
      const hash1 = hashSkill('', '');
      const hash2 = hashSkill('a', 'b');
      
      expect(hash1).toBeTruthy();
      expect(hash1).toHaveLength(64);
      expect(hash2).toBeTruthy();
      expect(hash2).toHaveLength(64);
    });
  });

  describe('collision resistance', () => {
    it('produces unique hashes for many similar inputs', () => {
      const hashes = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        const hash = hashSkill(`# Skill ${i}`, `GET /api/${i}`);
        hashes.add(hash);
      }
      
      // All hashes should be unique
      expect(hashes.size).toBe(100);
    });

    it('produces unique hashes for incrementally different content', () => {
      const hashes = new Set<string>();
      let content = '';
      
      for (let i = 0; i < 50; i++) {
        content += 'a';
        const hash = hashSkill(content, 'GET /api');
        hashes.add(hash);
      }
      
      expect(hashes.size).toBe(50);
    });
  });

  describe('content separation', () => {
    it('combines skillMd and apiTs with separator', () => {
      // The hash should be different from hashing either input alone
      const skillMd = '# Skill';
      const apiTs = 'GET /api';
      
      const combinedHash = hashSkill(skillMd, apiTs);
      const skillOnlyHash = hashSkill(skillMd, '');
      const apiOnlyHash = hashSkill('', apiTs);
      
      expect(combinedHash).not.toBe(skillOnlyHash);
      expect(combinedHash).not.toBe(apiOnlyHash);
    });

    it('treats separator as part of the content', () => {
      // If one input contains the separator, it should produce different hash
      const hash1 = hashSkill('# Skill', 'GET /api');
      const hash2 = hashSkill('# Skill\n---\nGET', '/api');
      
      // These should be different because the separator position differs
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('edge cases', () => {
    it('handles very long content', () => {
      const longSkillMd = '# Skill\n\n' + 'x'.repeat(100000);
      const longApiTs = 'GET /api\n' + 'y'.repeat(100000);
      
      const hash = hashSkill(longSkillMd, longApiTs);
      
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('handles special characters', () => {
      const skillMd = '# Skill\n\n!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      const apiTs = 'GET /api?param=value&other=123';
      
      const hash = hashSkill(skillMd, apiTs);
      
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('handles null bytes (if escaped in string)', () => {
      const skillMd = '# Skill\x00Hidden';
      const apiTs = 'GET /api';
      
      const hash = hashSkill(skillMd, apiTs);
      
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('handles emoji and special unicode', () => {
      const skillMd = '# 🚀 Rocket API 🌟\n\n火箭接口';
      const apiTs = 'GET /🔥/api';
      
      const hash1 = hashSkill(skillMd, apiTs);
      const hash2 = hashSkill(skillMd, apiTs);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('practical usage scenarios', () => {
    it('generates consistent version hashes for skill updates', () => {
      const v1SkillMd = '# Weather API v1\n\nGET /weather';
      const v1ApiTs = 'GET /weather';
      const v1Hash = hashSkill(v1SkillMd, v1ApiTs);

      const v2SkillMd = '# Weather API v2\n\nGET /weather\nGET /forecast';
      const v2ApiTs = 'GET /weather\nGET /forecast';
      const v2Hash = hashSkill(v2SkillMd, v2ApiTs);

      // Same version should give same hash
      expect(hashSkill(v1SkillMd, v1ApiTs)).toBe(v1Hash);
      expect(hashSkill(v2SkillMd, v2ApiTs)).toBe(v2Hash);

      // Different versions should give different hashes
      expect(v1Hash).not.toBe(v2Hash);
    });

    it('detects when skill content changes', () => {
      const originalSkill = '# API\n\nGET /users';
      const apiTs = 'GET /users';
      const originalHash = hashSkill(originalSkill, apiTs);

      const modifiedSkill = '# API\n\nGET /users\nPOST /users';
      const modifiedHash = hashSkill(modifiedSkill, apiTs);

      expect(originalHash).not.toBe(modifiedHash);
    });

    it('detects when API surface changes', () => {
      const skillMd = '# API';
      const originalApiTs = 'GET /users\nPOST /users';
      const originalHash = hashSkill(skillMd, originalApiTs);

      const modifiedApiTs = 'GET /users\nPOST /users\nDELETE /users/{id}';
      const modifiedHash = hashSkill(skillMd, modifiedApiTs);

      expect(originalHash).not.toBe(modifiedHash);
    });

    it('can be used for deduplication', () => {
      const skills = [
        { md: '# API A', ts: 'GET /a' },
        { md: '# API B', ts: 'GET /b' },
        { md: '# API A', ts: 'GET /a' }, // duplicate
        { md: '# API C', ts: 'GET /c' },
        { md: '# API B', ts: 'GET /b' }, // duplicate
      ];

      const hashes = new Map<string, { md: string; ts: string }>();
      
      for (const skill of skills) {
        const hash = hashSkill(skill.md, skill.ts);
        hashes.set(hash, skill);
      }

      // Should have only 3 unique skills
      expect(hashes.size).toBe(3);
    });
  });
});
