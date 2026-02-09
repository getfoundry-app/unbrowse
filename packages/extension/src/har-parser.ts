import type { ParsedRequest, AuthInfo } from './types.js';

const NOISE_DOMAINS = [
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.com',
  'facebook.net',
  'doubleclick.net',
  'googlesyndication.com',
  'hotjar.com',
  'segment.io',
  'segment.com',
  'mixpanel.com',
  'amplitude.com',
  'sentry.io',
  'intercom.io',
  'crisp.chat',
  'fullstory.com',
  'newrelic.com',
  'datadoghq.com',
];

const STATIC_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.woff', '.woff2', '.ttf', '.eot', '.ico', '.webp', '.map',
];

function isNoiseDomain(hostname: string): boolean {
  return NOISE_DOMAINS.some(d => hostname.includes(d));
}

function isStaticAsset(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return STATIC_EXTENSIONS.some(ext => lower.endsWith(ext));
}

function isJsonResponse(mimeType: string | undefined): boolean {
  if (!mimeType) return false;
  return mimeType.includes('json');
}

export class HarParser {
  static parse(harContent: string): ParsedRequest[] {
    const har = JSON.parse(harContent);
    const entries: unknown[] = har?.log?.entries ?? [];
    const results: ParsedRequest[] = [];

    for (const raw of entries) {
      const entry = raw as Record<string, unknown>;
      const request = entry.request as Record<string, unknown> | undefined;
      const response = entry.response as Record<string, unknown> | undefined;
      if (!request || !response) continue;

      const urlStr = request.url as string;
      let parsed: URL;
      try {
        parsed = new URL(urlStr);
      } catch {
        continue;
      }

      // Filter noise domains
      if (isNoiseDomain(parsed.hostname)) continue;

      // Filter static assets
      if (isStaticAsset(parsed.pathname)) continue;

      // Keep only XHR/Fetch when resourceType is available
      const resourceType = (entry as Record<string, string>)._resourceType;
      if (resourceType && !['xhr', 'fetch'].includes(resourceType)) continue;

      // Keep only JSON responses
      const content = response.content as Record<string, unknown> | undefined;
      const mimeType = (content?.mimeType as string) ?? (response.mimeType as string);
      if (!isJsonResponse(mimeType)) continue;

      results.push({
        path: parsed.pathname,
        domain: parsed.hostname,
        method: (request.method as string).toUpperCase(),
        status: response.status as number,
        verified: (response.status as number) >= 200 && (response.status as number) < 400,
      });
    }

    return results;
  }

  static extractAuth(harContent: string): AuthInfo {
    const har = JSON.parse(harContent);
    const entries: unknown[] = har?.log?.entries ?? [];

    const headers: Record<string, string> = {};
    const cookies: Record<string, string> = {};
    const tokens: string[] = [];
    let method: AuthInfo['method'] = 'none';

    for (const raw of entries) {
      const entry = raw as Record<string, unknown>;
      const request = entry.request as Record<string, unknown> | undefined;
      if (!request) continue;

      const reqHeaders = (request.headers as Array<{ name: string; value: string }>) ?? [];

      for (const h of reqHeaders) {
        const name = h.name.toLowerCase();
        const value = h.value;

        if (name === 'authorization') {
          if (value.toLowerCase().startsWith('bearer ')) {
            method = 'bearer';
            const token = value.slice(7).trim();
            if (!tokens.includes(token)) tokens.push(token);
          }
          headers[h.name] = value;
        }

        if (name === 'x-api-key' || name === 'api-key' || name === 'apikey') {
          if (method === 'none') method = 'apikey';
          headers[h.name] = value;
        }

        if (name === 'cookie') {
          if (method === 'none') method = 'session';
          for (const pair of value.split(';')) {
            const [k, ...rest] = pair.trim().split('=');
            if (k) cookies[k.trim()] = rest.join('=').trim();
          }
        }
      }
    }

    return { method, headers, cookies, tokens };
  }
}
