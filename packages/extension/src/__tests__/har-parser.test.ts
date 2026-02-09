import { describe, it, expect } from 'vitest';
import { HarParser } from '../har-parser.js';

function makeHar(entries: object[]) {
  return JSON.stringify({ log: { entries } });
}

function makeEntry(overrides: {
  url: string;
  method?: string;
  status?: number;
  mimeType?: string;
  resourceType?: string;
}) {
  const entry: Record<string, unknown> = {
    request: {
      url: overrides.url,
      method: overrides.method ?? 'GET',
      headers: [],
    },
    response: {
      status: overrides.status ?? 200,
      content: { mimeType: overrides.mimeType ?? 'application/json' },
    },
  };
  if (overrides.resourceType) {
    (entry as Record<string, string>)._resourceType = overrides.resourceType;
  }
  return entry;
}

describe('HarParser.parse', () => {
  it('parses valid XHR JSON requests', () => {
    const har = makeHar([
      makeEntry({ url: 'https://api.example.com/users/1', resourceType: 'xhr' }),
    ]);
    const results = HarParser.parse(har);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      path: '/users/1',
      domain: 'api.example.com',
      method: 'GET',
      status: 200,
      verified: true,
    });
  });

  it('filters out analytics domains', () => {
    const har = makeHar([
      makeEntry({ url: 'https://google-analytics.com/collect', resourceType: 'xhr' }),
      makeEntry({ url: 'https://www.googletagmanager.com/gtag', resourceType: 'xhr' }),
      makeEntry({ url: 'https://cdn.segment.io/v1/track', resourceType: 'xhr' }),
      makeEntry({ url: 'https://api.mixpanel.com/track', resourceType: 'xhr' }),
    ]);
    expect(HarParser.parse(har)).toHaveLength(0);
  });

  it('filters out static assets', () => {
    const har = makeHar([
      makeEntry({ url: 'https://example.com/bundle.js', mimeType: 'application/json' }),
      makeEntry({ url: 'https://example.com/style.css', mimeType: 'application/json' }),
      makeEntry({ url: 'https://example.com/logo.png', mimeType: 'application/json' }),
    ]);
    expect(HarParser.parse(har)).toHaveLength(0);
  });

  it('keeps XHR/Fetch JSON requests', () => {
    const har = makeHar([
      makeEntry({ url: 'https://api.example.com/data', resourceType: 'fetch', mimeType: 'application/json' }),
      makeEntry({ url: 'https://api.example.com/items', resourceType: 'xhr', mimeType: 'application/json; charset=utf-8' }),
    ]);
    expect(HarParser.parse(har)).toHaveLength(2);
  });

  it('filters out non-JSON responses when resourceType is present', () => {
    const har = makeHar([
      makeEntry({ url: 'https://example.com/page', resourceType: 'document', mimeType: 'text/html' }),
    ]);
    expect(HarParser.parse(har)).toHaveLength(0);
  });
});

describe('HarParser.extractAuth', () => {
  function makeAuthHar(headers: Array<{ name: string; value: string }>) {
    return JSON.stringify({
      log: {
        entries: [{ request: { headers }, response: {} }],
      },
    });
  }

  it('detects bearer tokens', () => {
    const har = makeAuthHar([
      { name: 'Authorization', value: 'Bearer abc123token' },
    ]);
    const auth = HarParser.extractAuth(har);
    expect(auth.method).toBe('bearer');
    expect(auth.tokens).toContain('abc123token');
  });

  it('detects API keys', () => {
    const har = makeAuthHar([
      { name: 'X-Api-Key', value: 'my-secret-key' },
    ]);
    const auth = HarParser.extractAuth(har);
    expect(auth.method).toBe('apikey');
    expect(auth.headers['X-Api-Key']).toBe('my-secret-key');
  });

  it('detects session cookies', () => {
    const har = makeAuthHar([
      { name: 'Cookie', value: 'session_id=abc123; theme=dark' },
    ]);
    const auth = HarParser.extractAuth(har);
    expect(auth.method).toBe('session');
    expect(auth.cookies['session_id']).toBe('abc123');
    expect(auth.cookies['theme']).toBe('dark');
  });

  it('returns none when no auth present', () => {
    const har = makeAuthHar([{ name: 'Accept', value: 'application/json' }]);
    const auth = HarParser.extractAuth(har);
    expect(auth.method).toBe('none');
  });
});
