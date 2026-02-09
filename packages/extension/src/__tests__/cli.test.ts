import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const CLI_PATH = join(__dirname, '../cli.ts');
const TEST_DIR = join(__dirname, '../../../test-output');
const TEST_SKILLS_DIR = join(TEST_DIR, 'skills');

describe('CLI Integration', () => {
  beforeEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up after tests
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  function runCli(args: string): { stdout: string; stderr: string; status: number } {
    try {
      const stdout = execSync(`cd ${TEST_DIR} && npx tsx ${CLI_PATH} ${args}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return { stdout, stderr: '', status: 0 };
    } catch (error: any) {
      return {
        stdout: error.stdout?.toString() ?? '',
        stderr: error.stderr?.toString() ?? '',
        status: error.status ?? 1,
      };
    }
  }

  function createSampleHar(filename: string): string {
    const harPath = join(TEST_DIR, filename);
    const har = {
      log: {
        version: '1.2',
        creator: { name: 'Test', version: '1.0' },
        entries: [
          {
            request: {
              url: 'https://api.test.com/users',
              method: 'GET',
              headers: [{ name: 'Accept', value: 'application/json' }],
            },
            response: {
              status: 200,
              content: { mimeType: 'application/json' },
            },
            _resourceType: 'xhr',
          },
          {
            request: {
              url: 'https://api.test.com/users/123',
              method: 'GET',
              headers: [
                { name: 'Accept', value: 'application/json' },
                { name: 'Authorization', value: 'Bearer test-token-xyz' },
              ],
            },
            response: {
              status: 200,
              content: { mimeType: 'application/json' },
            },
            _resourceType: 'fetch',
          },
          {
            request: {
              url: 'https://api.test.com/posts',
              method: 'POST',
              headers: [
                { name: 'Content-Type', value: 'application/json' },
                { name: 'Authorization', value: 'Bearer test-token-xyz' },
              ],
            },
            response: {
              status: 201,
              content: { mimeType: 'application/json' },
            },
            _resourceType: 'xhr',
          },
        ],
      },
    };
    writeFileSync(harPath, JSON.stringify(har, null, 2), 'utf-8');
    return harPath;
  }

  describe('learn command', () => {
    it('parses HAR file and generates skill files', () => {
      const harPath = createSampleHar('test.har');
      const result = runCli(`learn ${harPath}`);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Learning from HAR file');
      expect(result.stdout).toContain('Found 3 API requests');
      expect(result.stdout).toContain('api.test.com');
      expect(result.stdout).toContain('Generated skill at');

      // Check that skill files were created
      const skillPath = join(TEST_SKILLS_DIR, 'api.test.com', 'SKILL.md');
      const apiPath = join(TEST_SKILLS_DIR, 'api.test.com', 'api.ts');

      expect(existsSync(skillPath)).toBe(true);
      expect(existsSync(apiPath)).toBe(true);

      // Check SKILL.md content
      const skillContent = readFileSync(skillPath, 'utf-8');
      expect(skillContent).toContain('# api.test.com API Skill');
      expect(skillContent).toContain('Method: `bearer`');
      expect(skillContent).toContain('GET /users');
      expect(skillContent).toContain('POST /posts');

      // Check api.ts content
      const apiContent = readFileSync(apiPath, 'utf-8');
      expect(apiContent).toContain('const BASE_URL = "https://api.test.com"');
      expect(apiContent).toContain('export async function getUsers');
      expect(apiContent).toContain('export async function postPosts');
      expect(apiContent).toContain('Authorization: `Bearer ${token}`');
    });

    it('fails gracefully with non-existent HAR file', () => {
      const result = runCli('learn nonexistent.har');
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('HAR file not found');
    });

    it('fails gracefully with empty HAR file', () => {
      const emptyHarPath = join(TEST_DIR, 'empty.har');
      writeFileSync(emptyHarPath, JSON.stringify({ log: { entries: [] } }), 'utf-8');

      const result = runCli(`learn ${emptyHarPath}`);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('No API requests found');
    });

    it('detects different auth methods correctly', () => {
      const harPath = join(TEST_DIR, 'apikey.har');
      const har = {
        log: {
          version: '1.2',
          creator: { name: 'Test', version: '1.0' },
          entries: [
            {
              request: {
                url: 'https://api.example.com/data',
                method: 'GET',
                headers: [{ name: 'X-Api-Key', value: 'secret-key-123' }],
              },
              response: {
                status: 200,
                content: { mimeType: 'application/json' },
              },
              _resourceType: 'xhr',
            },
          ],
        },
      };
      writeFileSync(harPath, JSON.stringify(har, null, 2), 'utf-8');

      const result = runCli(`learn ${harPath}`);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Auth: apikey');

      const apiPath = join(TEST_SKILLS_DIR, 'api.example.com', 'api.ts');
      const apiContent = readFileSync(apiPath, 'utf-8');
      expect(apiContent).toContain('X-Api-Key');
    });
  });

  describe('skills command', () => {
    it('lists local skills', () => {
      // First create a skill
      const harPath = createSampleHar('list-test.har');
      runCli(`learn ${harPath}`);

      // Then list skills
      const result = runCli('skills');
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Local skills');
      expect(result.stdout).toContain('api.test.com');
      expect(result.stdout).toContain('✓ SKILL.md');
      expect(result.stdout).toContain('✓ api.ts');
      expect(result.stdout).toContain('3 endpoints');
      expect(result.stdout).toContain('auth: bearer');
    });

    it('shows message when no skills exist', () => {
      const result = runCli('skills');
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('No skills directory found');
    });
  });

  describe('help command', () => {
    it('shows help when no arguments provided', () => {
      const result = runCli('');
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Unbrowse CLI');
      expect(result.stdout).toContain('Commands:');
      expect(result.stdout).toContain('capture <url>');
      expect(result.stdout).toContain('learn <har-file>');
      expect(result.stdout).toContain('search <query>');
      expect(result.stdout).toContain('replay <ability-id>');
      expect(result.stdout).toContain('skills');
      expect(result.stdout).toContain('stats');
    });

    it('shows help with --help flag', () => {
      const result = runCli('--help');
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Unbrowse CLI');
    });

    it('shows help with help command', () => {
      const result = runCli('help');
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Unbrowse CLI');
    });
  });

  describe('error handling', () => {
    it('handles unknown commands gracefully', () => {
      const result = runCli('unknown-command');
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('Unknown command');
    });

    it('handles missing arguments', () => {
      const learnResult = runCli('learn');
      expect(learnResult.status).toBe(1);
      expect(learnResult.stdout).toContain('Missing HAR file argument');

      const captureResult = runCli('capture');
      expect(captureResult.status).toBe(1);
      expect(captureResult.stdout).toContain('Missing URL argument');

      const searchResult = runCli('search');
      expect(searchResult.status).toBe(1);
      expect(searchResult.stdout).toContain('Missing query argument');

      const replayResult = runCli('replay');
      expect(replayResult.status).toBe(1);
      expect(replayResult.stdout).toContain('Missing ability ID argument');
    });
  });

  describe('capture command', () => {
    it('falls back to direct fetch when CDP unavailable', async () => {
      const result = runCli('capture https://jsonplaceholder.typicode.com/posts/1');

      // CDP will fail (no Chrome with debugging), but fetch should work
      expect(result.stdout).toContain('Capturing API traffic');
      expect(result.stdout).toContain('CDP capture failed');
      expect(result.stdout).toContain('Falling back to direct fetch');
      expect(result.stdout).toContain('Fetched https://jsonplaceholder.typicode.com/posts/1');
    }, 15000); // Increase timeout for network request
  });
});

describe('CLI Output Formatting', () => {
  it('uses colors in terminal output', () => {
    const result = execSync(`npx tsx ${CLI_PATH} --help`, {
      encoding: 'utf-8',
      env: { ...process.env, FORCE_COLOR: '1' },
    });

    // Check for ANSI color codes
    expect(result).toContain('\x1b['); // Should contain ANSI escape sequences
    expect(result).toContain('Unbrowse CLI');
  });
});
