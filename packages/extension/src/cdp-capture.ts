import puppeteer, { type Browser, type CDPSession } from 'puppeteer-core';
import type { HarEntry } from './types.js';

const NOISE_DOMAINS = [
  'google-analytics.com', 'googletagmanager.com', 'facebook.com',
  'facebook.net', 'doubleclick.net', 'googlesyndication.com',
  'hotjar.com', 'segment.io', 'segment.com', 'mixpanel.com',
  'amplitude.com', 'sentry.io', 'intercom.io', 'crisp.chat',
  'fullstory.com', 'newrelic.com', 'datadoghq.com',
];

const STATIC_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.woff', '.woff2', '.ttf', '.eot', '.ico', '.webp', '.map',
];

function isNoise(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (NOISE_DOMAINS.some(d => parsed.hostname.includes(d))) return true;
    const lower = parsed.pathname.toLowerCase();
    if (STATIC_EXTENSIONS.some(ext => lower.endsWith(ext))) return true;
  } catch {
    return true;
  }
  return false;
}

export interface CaptureOptions {
  waitMs?: number;
  interactions?: string[];
  wsEndpoint?: string;
}

interface PendingRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string;
}

export class CDPCapture {
  private wsEndpoint: string;

  constructor(wsEndpoint = 'ws://localhost:9222') {
    this.wsEndpoint = wsEndpoint;
  }

  async capture(url: string, options: CaptureOptions = {}): Promise<HarEntry[]> {
    const { waitMs = 2000 } = options;
    const entries: HarEntry[] = [];
    const pending = new Map<string, PendingRequest>();

    const browser: Browser = await puppeteer.connect({
      browserWSEndpoint: this.wsEndpoint,
    });

    const page = await browser.newPage();
    const client: CDPSession = await page.createCDPSession();

    await client.send('Network.enable');

    client.on('Network.requestWillBeSent', (params: Record<string, unknown>) => {
      const req = params as {
        requestId: string;
        type: string;
        request: { url: string; method: string; headers: Record<string, string>; postData?: string };
      };
      if (req.type !== 'XHR' && req.type !== 'Fetch') return;
      if (isNoise(req.request.url)) return;
      pending.set(req.requestId, {
        url: req.request.url,
        method: req.request.method,
        headers: req.request.headers,
        postData: req.request.postData,
      });
    });

    client.on('Network.responseReceived', (params: Record<string, unknown>) => {
      const resp = params as {
        requestId: string;
        response: { status: number; headers: Record<string, string>; mimeType: string };
      };
      const req = pending.get(resp.requestId);
      if (!req) return;
      if (!resp.response.mimeType?.includes('json')) {
        pending.delete(resp.requestId);
        return;
      }
      entries.push({
        url: req.url,
        method: req.method,
        status: resp.response.status,
        requestHeaders: req.headers,
        responseHeaders: resp.response.headers,
        requestBody: req.postData,
        responseBody: undefined,
        mimeType: resp.response.mimeType,
      });
      pending.delete(resp.requestId);
    });

    // Try to get response bodies
    client.on('Network.loadingFinished', async (params: Record<string, unknown>) => {
      const { requestId } = params as { requestId: string };
      const entry = entries.find((_, i) => i === entries.length - 1);
      if (!entry) return;
      try {
        const result = await client.send('Network.getResponseBody', { requestId }) as { body: string };
        // Match by finding the entry that was most recently added for this request
        const match = entries.find(e => e.responseBody === undefined && e.url === entry.url);
        if (match) match.responseBody = result.body;
      } catch {
        // Response body not available
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, waitMs));

    await page.close();
    // Don't close browser — we connected to an existing instance

    return entries;
  }
}
