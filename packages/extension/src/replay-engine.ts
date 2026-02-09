import type { ApiEndpoint, AuthInfo } from './types.js';

export interface ReplayResult {
  status: number;
  data: unknown;
  latencyMs: number;
}

interface HealthRecord {
  successes: number;
  failures: number;
}

export class ReplayEngine {
  private health = new Map<string, HealthRecord>();

  private getRecord(fingerprint: string): HealthRecord {
    let rec = this.health.get(fingerprint);
    if (!rec) {
      rec = { successes: 0, failures: 0 };
      this.health.set(fingerprint, rec);
    }
    return rec;
  }

  getHealthScore(fingerprint: string): number {
    const rec = this.health.get(fingerprint);
    if (!rec) return 1;
    const total = rec.successes + rec.failures;
    if (total === 0) return 1;
    return rec.successes / total;
  }

  async replay(
    endpoint: ApiEndpoint,
    auth: AuthInfo,
    params?: Record<string, unknown>,
  ): Promise<ReplayResult> {
    const result = await this.doRequest(endpoint, auth, params);

    const rec = this.getRecord(endpoint.fingerprint);
    if (result.status >= 200 && result.status < 400) {
      rec.successes++;
    } else {
      rec.failures++;
    }

    // Handle 401 with refresh
    if (result.status === 401 && auth.refreshConfig) {
      const refreshed = await this.refreshAuth(auth);
      if (refreshed) {
        const retry = await this.doRequest(endpoint, auth, params);
        if (retry.status >= 200 && retry.status < 400) {
          rec.failures--; // undo the failure
          rec.successes++;
        }
        return retry;
      }
    }

    return result;
  }

  private async doRequest(
    endpoint: ApiEndpoint,
    auth: AuthInfo,
    params?: Record<string, unknown>,
  ): Promise<ReplayResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...auth.headers,
    };

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase());
    const start = Date.now();

    const response = await fetch(endpoint.originalPath, {
      method: endpoint.method,
      headers,
      body: hasBody && params ? JSON.stringify(params) : undefined,
    });

    const latencyMs = Date.now() - start;
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = await response.text().catch(() => null);
    }

    return { status: response.status, data, latencyMs };
  }

  private async refreshAuth(auth: AuthInfo): Promise<boolean> {
    if (!auth.refreshConfig) return false;
    try {
      const resp = await fetch(auth.refreshConfig.endpoint, {
        method: auth.refreshConfig.method,
        headers: { 'Content-Type': 'application/json', ...auth.headers },
        body: auth.refreshConfig.body ? JSON.stringify(auth.refreshConfig.body) : undefined,
      });
      if (!resp.ok) return false;
      const data = (await resp.json()) as Record<string, unknown>;
      // Update auth headers with new token if present
      const newToken = (data.access_token ?? data.token ?? data.accessToken) as string | undefined;
      if (newToken) {
        auth.headers['Authorization'] = `Bearer ${newToken}`;
        auth.tokens = [newToken, ...auth.tokens.slice(1)];
      }
      return true;
    } catch {
      return false;
    }
  }
}
