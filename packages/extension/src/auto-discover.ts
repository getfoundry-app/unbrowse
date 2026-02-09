import type { HarEntry, ParsedRequest, AuthInfo } from './types.js';
import { SkillGenerator } from './skill-generator.js';

export interface DiscoveryResult {
  domain: string;
  skillMd: string;
  apiTs: string;
  endpointsCount: number;
}

export class AutoDiscovery {
  private domainCounts = new Map<string, HarEntry[]>();
  private lastGenerated = new Map<string, number>();
  private existingSkills = new Set<string>();
  private cooldownMs: number;
  private threshold: number;

  constructor(options?: { cooldownMs?: number; threshold?: number; existingSkills?: string[] }) {
    this.cooldownMs = options?.cooldownMs ?? 30_000;
    this.threshold = options?.threshold ?? 5;
    if (options?.existingSkills) {
      for (const s of options.existingSkills) this.existingSkills.add(s);
    }
  }

  addExistingSkill(domain: string): void {
    this.existingSkills.add(domain);
  }

  async ingest(entry: HarEntry): Promise<DiscoveryResult | null> {
    let domain: string;
    try {
      domain = new URL(entry.url).hostname;
    } catch {
      return null;
    }

    if (this.existingSkills.has(domain)) return null;

    const entries = this.domainCounts.get(domain) ?? [];
    entries.push(entry);
    this.domainCounts.set(domain, entries);

    if (entries.length < this.threshold) return null;

    const lastGen = this.lastGenerated.get(domain) ?? 0;
    if (Date.now() - lastGen < this.cooldownMs) return null;

    this.lastGenerated.set(domain, Date.now());
    this.existingSkills.add(domain);

    const parsed: ParsedRequest[] = entries.map(e => {
      let path = '/';
      try { path = new URL(e.url).pathname; } catch { /* keep default */ }
      return {
        path,
        domain,
        method: e.method,
        status: e.status,
        verified: false,
      };
    });

    const auth: AuthInfo = this.extractAuth(entries);
    const generator = new SkillGenerator();
    const result = generator.generate(parsed, auth, domain);

    // Reset collected entries for this domain
    this.domainCounts.set(domain, []);

    return {
      domain,
      skillMd: result.skillMd,
      apiTs: result.apiTs,
      endpointsCount: parsed.length,
    };
  }

  async ingestBatch(entries: HarEntry[]): Promise<DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];
    for (const entry of entries) {
      const result = await this.ingest(entry);
      if (result) results.push(result);
    }
    return results;
  }

  private extractAuth(entries: HarEntry[]): AuthInfo {
    const auth: AuthInfo = { method: 'none', headers: {}, cookies: {}, tokens: [] };
    for (const e of entries) {
      const authHeader = e.requestHeaders['Authorization'] ?? e.requestHeaders['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        auth.method = 'bearer';
        const token = authHeader.slice(7);
        if (!auth.tokens.includes(token)) auth.tokens.push(token);
        auth.headers['Authorization'] = authHeader;
        break;
      }
      const apiKey = e.requestHeaders['X-Api-Key'] ?? e.requestHeaders['x-api-key'];
      if (apiKey) {
        auth.method = 'apikey';
        auth.headers['X-Api-Key'] = apiKey;
        break;
      }
    }
    return auth;
  }
}
