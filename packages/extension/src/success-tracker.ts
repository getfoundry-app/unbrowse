/**
 * Success Tracker
 * Tracks execution success rates and latency per ability, assigns quality tiers.
 */

export interface AbilityStats {
  total: number;
  successful: number;
  avgLatency: number;
  successRate: number;
  qualityTier: string;
}

function computeTier(rate: number): string {
  if (rate >= 0.95) return 'Gold';
  if (rate >= 0.85) return 'Silver';
  if (rate >= 0.70) return 'Bronze';
  if (rate >= 0.50) return 'Unranked';
  return 'Poor';
}

interface Record {
  success: boolean;
  latencyMs: number;
}

export class SuccessTracker {
  private records = new Map<string, Record[]>();

  track(abilityId: string, success: boolean, latencyMs: number): void {
    let list = this.records.get(abilityId);
    if (!list) {
      list = [];
      this.records.set(abilityId, list);
    }
    list.push({ success, latencyMs });
  }

  getStats(abilityId: string): AbilityStats {
    const list = this.records.get(abilityId) ?? [];
    const total = list.length;
    const successful = list.filter(r => r.success).length;
    const avgLatency = total > 0 ? list.reduce((s, r) => s + r.latencyMs, 0) / total : 0;
    const successRate = total > 0 ? successful / total : 0;
    return {
      total,
      successful,
      avgLatency: Math.round(avgLatency * 100) / 100,
      successRate: Math.round(successRate * 10000) / 10000,
      qualityTier: computeTier(successRate),
    };
  }
}
