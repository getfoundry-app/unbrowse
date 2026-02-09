import { describe, it, expect } from 'vitest';
import { SkillGenerator } from '../skill-generator.js';
import type { ParsedRequest, AuthInfo } from '../types.js';

const mockRequests: ParsedRequest[] = [
  { path: '/api/users/123', domain: 'api.example.com', method: 'GET', status: 200, verified: true },
  { path: '/api/users', domain: 'api.example.com', method: 'POST', status: 201, verified: true },
];

const mockAuth: AuthInfo = {
  method: 'bearer',
  headers: { Authorization: 'Bearer tok' },
  cookies: {},
  tokens: ['tok'],
};

describe('SkillGenerator', () => {
  const gen = new SkillGenerator();

  it('generates SKILL.md with endpoint info', () => {
    const { skillMd } = gen.generate(mockRequests, mockAuth, 'api.example.com');
    expect(skillMd).toContain('GET');
    expect(skillMd).toContain('/api/users');
    expect(skillMd).toContain('POST');
    expect(skillMd).toContain('## Endpoints');
  });

  it('generates api.ts with typed client functions', () => {
    const { apiTs } = gen.generate(mockRequests, mockAuth, 'api.example.com');
    expect(apiTs).toContain('export async function');
    expect(apiTs).toContain('Promise<unknown>');
    expect(apiTs).toContain('fetch(');
  });

  it('includes auth method in SKILL.md', () => {
    const { skillMd } = gen.generate(mockRequests, mockAuth, 'api.example.com');
    expect(skillMd).toContain('bearer');
    expect(skillMd).toContain('## Authentication');
  });

  it('generates bearer auth helper in api.ts', () => {
    const { apiTs } = gen.generate(mockRequests, mockAuth, 'api.example.com');
    expect(apiTs).toContain('Bearer');
    expect(apiTs).toContain('getAuthHeaders');
  });
});
