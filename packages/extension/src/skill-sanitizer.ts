/**
 * Skill Sanitizer
 * Strips credentials from SKILL.md before publishing.
 */

const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; placeholder: string }> = [
  // Bearer tokens
  { pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, placeholder: 'Bearer <YOUR_TOKEN>' },
  // Generic API keys (hex, base64, uuid-like)
  { pattern: /(?:api[_-]?key|apikey|api[_-]?token)\s*[:=]\s*["']?([A-Za-z0-9\-._~+/]{16,})["']?/gi, placeholder: 'api_key: <YOUR_API_KEY>' },
  // Session cookies
  { pattern: /(?:session|sess|sid|token|jwt)\s*[:=]\s*["']?([A-Za-z0-9\-._~+/]{16,})["']?/gi, placeholder: 'session: <YOUR_SESSION>' },
  // Authorization header values
  { pattern: /Authorization:\s*[^\n`]*/gi, placeholder: 'Authorization: <YOUR_AUTH>' },
  // Inline tokens that look like secrets (long alphanumeric strings after common key names)
  { pattern: /(?:secret|password|passwd|access_token|refresh_token)\s*[:=]\s*["']?([A-Za-z0-9\-._~+/]{8,})["']?/gi, placeholder: '<REDACTED_SECRET>' },
];

export function sanitizeForPublish(skillMd: string, _authJson?: unknown): { skillMd: string } {
  let sanitized = skillMd;

  for (const { pattern, placeholder } of SENSITIVE_PATTERNS) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    sanitized = sanitized.replace(pattern, placeholder);
  }

  // Never include auth.json content - we simply don't return it
  return { skillMd: sanitized };
}
