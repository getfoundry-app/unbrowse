import puppeteer, { type Browser, type CDPSession } from 'puppeteer-core';
import type { Protocol } from 'puppeteer-core';
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

    client.on('Network.requestWillBeSent', (event: Protocol.Network.RequestWillBeSentEvent) => {
      if (event.type !== 'XHR' && event.type !== 'Fetch') return;
      if (isNoise(event.request.url)) return;
      pending.set(event.requestId, {
        url: event.request.url,
        method: event.request.method,
        headers: event.request.headers as Record<string, string>,
        postData: event.request.postData,
      });
    });

    client.on('Network.responseReceived', (event: Protocol.Network.ResponseReceivedEvent) => {
      const req = pending.get(event.requestId);
      if (!req) return;
      if (!event.response.mimeType?.includes('json')) {
        pending.delete(event.requestId);
        return;
      }
      entries.push({
        url: req.url,
        method: req.method,
        status: event.response.status,
        requestHeaders: req.headers,
        responseHeaders: event.response.headers as Record<string, string>,
        requestBody: req.postData,
        responseBody: undefined,
        mimeType: event.response.mimeType,
      });
      pending.delete(event.requestId);
    });

    // Try to get response bodies
    client.on('Network.loadingFinished', async (event: Protocol.Network.LoadingFinishedEvent) => {
      const lastEntry = entries[entries.length - 1];
      if (!lastEntry) return;
      try {
        const result = await client.send('Network.getResponseBody', { requestId: event.requestId }) as { body: string };
        const match = entries.find(e => e.responseBody === undefined);
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
