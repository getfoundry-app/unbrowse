import { describe, it, expect } from 'vitest';
import { sanitizeForPublish } from '../skill-sanitizer.js';

describe('sanitizeForPublish', () => {
  describe('Bearer token stripping', () => {
    it('strips Bearer tokens from Authorization headers', () => {
      const skillMd = `
# API Skill

Authorization: Bearer sk-1234567890abcdefghijklmnopqrstuvwxyz

Make requests with this token.
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('Authorization: <YOUR_AUTH>');
      expect(result.skillMd).not.toContain('sk-1234567890abcdefghijklmnopqrstuvwxyz');
    });

    it('strips multiple Bearer tokens', () => {
      const skillMd = `
Authorization: Bearer token-abc123
Authorization: Bearer token-xyz789
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('Authorization: <YOUR_AUTH>');
      expect(result.skillMd).not.toContain('token-abc123');
      expect(result.skillMd).not.toContain('token-xyz789');
    });

    it('handles Bearer tokens with special characters', () => {
      const skillMd = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('Bearer <YOUR_TOKEN>');
      expect(result.skillMd).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('strips Bearer tokens with varying whitespace', () => {
      const skillMd = `
Bearer  token-with-spaces
Bearer	token-with-tab
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('Bearer <YOUR_TOKEN>');
      expect(result.skillMd).not.toContain('token-with-spaces');
      expect(result.skillMd).not.toContain('token-with-tab');
    });
  });

  describe('API key stripping', () => {
    it('strips API keys with common patterns', () => {
      const skillMd = `
api_key: sk-proj-abcdef1234567890
apikey: my-secret-api-key-value
API_KEY: PROD_KEY_XYZ123456
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('api_key: <YOUR_API_KEY>');
      expect(result.skillMd).not.toContain('sk-proj-abcdef1234567890');
      expect(result.skillMd).not.toContain('my-secret-api-key-value');
      expect(result.skillMd).not.toContain('PROD_KEY_XYZ123456');
    });

    it('strips api-token variants', () => {
      const skillMd = `
api-token: abc123def456ghi789
api_token="quoted-token-value"
apiToken: camelCaseToken123
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('api_key: <YOUR_API_KEY>');
      expect(result.skillMd).not.toContain('abc123def456ghi789');
      expect(result.skillMd).not.toContain('quoted-token-value');
      expect(result.skillMd).not.toContain('camelCaseToken123');
    });

    it('handles X-Api-Key header format', () => {
      const skillMd = `
curl -H "Authorization: sk-live-abc123xyz789"
X-API-Key: prod-key-1234567890abcdef
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('<YOUR_AUTH>');
      expect(result.skillMd).not.toContain('sk-live-abc123xyz789');
    });

    it('does not strip short values that might not be keys', () => {
      const skillMd = `
api_key: key
apikey: abc
`;
      // These are too short (< 16 chars) and should not match
      const result = sanitizeForPublish(skillMd);
      // The pattern requires 16+ chars, so these should remain
      expect(result.skillMd).toContain('api_key: key');
      expect(result.skillMd).toContain('apikey: abc');
    });
  });

  describe('session cookie stripping', () => {
    it('strips session identifiers', () => {
      const skillMd = `
session: abc123def456ghi789jkl012
sess: user-session-token-value-here
sid: session-identifier-123456
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('session: <YOUR_SESSION>');
      expect(result.skillMd).not.toContain('abc123def456ghi789jkl012');
      expect(result.skillMd).not.toContain('user-session-token-value-here');
      expect(result.skillMd).not.toContain('session-identifier-123456');
    });

    it('strips token and jwt values', () => {
      const skillMd = `
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
jwt: eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('session: <YOUR_SESSION>');
      expect(result.skillMd).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(result.skillMd).not.toContain('eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0');
    });

    it('handles Cookie header with multiple values', () => {
      const skillMd = `
Cookie: session_id=abc123def456; theme=dark; lang=en
`;
      // Note: The current pattern strips individual session/token patterns
      // but may not handle full Cookie header format - it only matches key: value format
      const result = sanitizeForPublish(skillMd);
      // The pattern requires space after colon, so Cookie header won't match
      expect(result.skillMd).toContain('session_id=abc123def456');
    });
  });

  describe('Authorization header stripping', () => {
    it('strips Authorization header values', () => {
      const skillMd = `
Authorization: Bearer secret-token-here
Authorization: Basic dXNlcjpwYXNzd29yZA==
Authorization: custom-auth-value
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('Authorization: <YOUR_AUTH>');
      expect(result.skillMd).not.toContain('secret-token-here');
      expect(result.skillMd).not.toContain('dXNlcjpwYXNzd29yZA==');
      expect(result.skillMd).not.toContain('custom-auth-value');
    });

    it('handles inline code blocks with Authorization', () => {
      const skillMd = `
\`\`\`bash
curl -H "Authorization: Bearer sk-live-prod-key-12345"
\`\`\`
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('Authorization: <YOUR_AUTH>');
      expect(result.skillMd).not.toContain('sk-live-prod-key-12345');
    });
  });

  describe('generic secret stripping', () => {
    it('strips password fields', () => {
      const skillMd = `
password: my-secret-password-123
passwd: another-password-value
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('<REDACTED_SECRET>');
      expect(result.skillMd).not.toContain('my-secret-password-123');
      expect(result.skillMd).not.toContain('another-password-value');
    });

    it('strips secret values', () => {
      const skillMd = `
secret: my-app-secret-key-here
client_secret: oauth-client-secret-value
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('<REDACTED_SECRET>');
      expect(result.skillMd).not.toContain('my-app-secret-key-here');
      expect(result.skillMd).not.toContain('oauth-client-secret-value');
    });

    it('strips access and refresh tokens', () => {
      const skillMd = `
access_token: at_1234567890abcdef
refresh_token: rt_0987654321zyxwvu
`;
      const result = sanitizeForPublish(skillMd);
      // access_token and refresh_token match the generic secret pattern OR the session pattern (token keyword)
      // The session pattern matches first: token: value
      expect(result.skillMd).toContain('<YOUR_SESSION>');
      expect(result.skillMd).not.toContain('at_1234567890abcdef');
      expect(result.skillMd).not.toContain('rt_0987654321zyxwvu');
    });

    it('requires minimum length for secret patterns', () => {
      const skillMd = `
secret: short
password: pw
`;
      // These are < 8 chars and should not match
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('secret: short');
      expect(result.skillMd).toContain('password: pw');
    });
  });

  describe('placeholder insertion', () => {
    it('inserts Bearer placeholder correctly', () => {
      const skillMd = `Authorization: Bearer real-token-123456789`;
      const result = sanitizeForPublish(skillMd);
      // Authorization pattern matches the entire line first
      expect(result.skillMd).toContain('Authorization: <YOUR_AUTH>');
      expect(result.skillMd).toMatch(/Authorization: <YOUR_AUTH>/);
    });

    it('inserts API key placeholder correctly', () => {
      const skillMd = `api_key: real-key-1234567890abcdef`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('api_key: <YOUR_API_KEY>');
    });

    it('inserts session placeholder correctly', () => {
      const skillMd = `session: real-session-id-12345678`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('session: <YOUR_SESSION>');
    });

    it('inserts Authorization placeholder correctly', () => {
      const skillMd = `Authorization: some-auth-value`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('Authorization: <YOUR_AUTH>');
    });

    it('inserts generic secret placeholder correctly', () => {
      const skillMd = `password: secret-password-123`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('<REDACTED_SECRET>');
    });
  });

  describe('non-sensitive content preservation', () => {
    it('preserves API endpoint URLs', () => {
      const skillMd = `
GET https://api.example.com/v1/users
POST https://api.example.com/v1/data
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('https://api.example.com/v1/users');
      expect(result.skillMd).toContain('https://api.example.com/v1/data');
    });

    it('preserves documentation text', () => {
      const skillMd = `
# Example API Skill

This skill demonstrates how to use the Example API.

## Usage

1. Set your API key
2. Make requests to the endpoints
3. Handle responses

## Example

Make a GET request to fetch user data.
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('# Example API Skill');
      expect(result.skillMd).toContain('This skill demonstrates');
      expect(result.skillMd).toContain('## Usage');
      expect(result.skillMd).toContain('## Example');
    });

    it('preserves JSON schema examples', () => {
      const skillMd = `
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
\`\`\`
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('"name": "John Doe"');
      expect(result.skillMd).toContain('"email": "john@example.com"');
      expect(result.skillMd).toContain('"age": 30');
    });

    it('preserves parameter descriptions', () => {
      const skillMd = `
Parameters:
- \`user_id\`: The unique identifier for the user
- \`limit\`: Maximum number of results (default: 10)
- \`offset\`: Pagination offset (default: 0)
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('user_id');
      expect(result.skillMd).toContain('limit');
      expect(result.skillMd).toContain('offset');
      expect(result.skillMd).toContain('Maximum number of results');
    });

    it('preserves code examples without secrets', () => {
      const skillMd = `
\`\`\`javascript
const response = await fetch('/api/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});
\`\`\`
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('const response = await fetch');
      expect(result.skillMd).toContain("'Content-Type': 'application/json'");
    });

    it('preserves non-secret header names', () => {
      const skillMd = `
Headers:
- Content-Type: application/json
- Accept: application/json
- User-Agent: MyApp/1.0
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toContain('Content-Type: application/json');
      expect(result.skillMd).toContain('Accept: application/json');
      expect(result.skillMd).toContain('User-Agent: MyApp/1.0');
    });
  });

  describe('combined scenarios', () => {
    it('handles mixed sensitive and non-sensitive content', () => {
      const skillMd = `
# Weather API

Base URL: https://api.weather.com/v1

## Authentication

Authorization: Bearer sk-weather-prod-key-123456789

## Endpoints

GET /current?city={city}
GET /forecast?city={city}&days={days}

## Example

\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  https://api.weather.com/v1/current?city=London
\`\`\`
`;
      const result = sanitizeForPublish(skillMd);
      
      // Should preserve
      expect(result.skillMd).toContain('# Weather API');
      expect(result.skillMd).toContain('https://api.weather.com/v1');
      expect(result.skillMd).toContain('GET /current?city={city}');
      
      // Should strip
      expect(result.skillMd).not.toContain('sk-weather-prod-key-123456789');
      expect(result.skillMd).toContain('Authorization: <YOUR_AUTH>');
    });

    it('handles multiple credential types in one document', () => {
      const skillMd = `
Authorization: Bearer token-abc-123456789
X-API-Key: api-key-xyz-987654321
session: session-id-def-456789012
password: secret-pass-123456
`;
      const result = sanitizeForPublish(skillMd);
      
      expect(result.skillMd).not.toContain('token-abc-123456789');
      expect(result.skillMd).not.toContain('api-key-xyz-987654321');
      expect(result.skillMd).not.toContain('session-id-def-456789012');
      expect(result.skillMd).not.toContain('secret-pass-123456');
      
      expect(result.skillMd).toContain('Authorization: <YOUR_AUTH>');
      expect(result.skillMd).toContain('session: <YOUR_SESSION>');
      expect(result.skillMd).toContain('<REDACTED_SECRET>');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      const result = sanitizeForPublish('');
      expect(result.skillMd).toBe('');
    });

    it('handles content with no secrets', () => {
      const skillMd = `
# Simple API

GET /health
POST /data
`;
      const result = sanitizeForPublish(skillMd);
      expect(result.skillMd).toBe(skillMd);
    });

    it('handles malformed credential patterns gracefully', () => {
      const skillMd = `
Bearer
api_key:
session:
Authorization:
`;
      const result = sanitizeForPublish(skillMd);
      // Should not crash or cause issues
      expect(result.skillMd).toBeTruthy();
    });

    it('never includes auth.json content', () => {
      const skillMd = `# API Skill\nAuthorization: Bearer token-123456789012345678`;
      const authJson = { secret: 'should-never-appear' };
      
      const result = sanitizeForPublish(skillMd, authJson);
      
      expect(result.skillMd).not.toContain('should-never-appear');
      expect(result).not.toHaveProperty('authJson');
      expect(Object.keys(result)).toEqual(['skillMd']);
    });
  });
});
