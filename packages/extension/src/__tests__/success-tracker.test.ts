import { describe, it, expect, beforeEach } from 'vitest';
import { SuccessTracker } from '../success-tracker.js';

describe('SuccessTracker', () => {
  let tracker: SuccessTracker;

  beforeEach(() => {
    tracker = new SuccessTracker();
  });

  describe('track', () => {
    it('tracks successful executions', () => {
      tracker.track('ability-1', true, 100);
      tracker.track('ability-1', true, 150);
      tracker.track('ability-1', true, 200);

      const stats = tracker.getStats('ability-1');
      expect(stats.total).toBe(3);
      expect(stats.successful).toBe(3);
      expect(stats.successRate).toBe(1.0);
    });

    it('tracks failed executions', () => {
      tracker.track('ability-2', false, 50);
      tracker.track('ability-2', false, 75);
      tracker.track('ability-2', true, 100);

      const stats = tracker.getStats('ability-2');
      expect(stats.total).toBe(3);
      expect(stats.successful).toBe(1);
      expect(stats.successRate).toBeCloseTo(0.3333, 4);
    });

    it('tracks multiple abilities independently', () => {
      tracker.track('ability-a', true, 100);
      tracker.track('ability-b', false, 200);

      const statsA = tracker.getStats('ability-a');
      const statsB = tracker.getStats('ability-b');

      expect(statsA.successful).toBe(1);
      expect(statsB.successful).toBe(0);
    });
  });

  describe('quality tier calculation', () => {
    it('assigns Gold tier at 95%+ success rate', () => {
      // 19 successes out of 20 = 95%
      for (let i = 0; i < 19; i++) {
        tracker.track('gold-ability', true, 100);
      }
      tracker.track('gold-ability', false, 100);

      const stats = tracker.getStats('gold-ability');
      expect(stats.successRate).toBe(0.95);
      expect(stats.qualityTier).toBe('Gold');
    });

    it('assigns Gold tier at 100% success rate', () => {
      for (let i = 0; i < 10; i++) {
        tracker.track('perfect-ability', true, 100);
      }

      const stats = tracker.getStats('perfect-ability');
      expect(stats.successRate).toBe(1.0);
      expect(stats.qualityTier).toBe('Gold');
    });

    it('assigns Silver tier at 85%+ success rate', () => {
      // 17 successes out of 20 = 85%
      for (let i = 0; i < 17; i++) {
        tracker.track('silver-ability', true, 100);
      }
      for (let i = 0; i < 3; i++) {
        tracker.track('silver-ability', false, 100);
      }

      const stats = tracker.getStats('silver-ability');
      expect(stats.successRate).toBe(0.85);
      expect(stats.qualityTier).toBe('Silver');
    });

    it('assigns Bronze tier at 70%+ success rate', () => {
      // 14 successes out of 20 = 70%
      for (let i = 0; i < 14; i++) {
        tracker.track('bronze-ability', true, 100);
      }
      for (let i = 0; i < 6; i++) {
        tracker.track('bronze-ability', false, 100);
      }

      const stats = tracker.getStats('bronze-ability');
      expect(stats.successRate).toBe(0.7);
      expect(stats.qualityTier).toBe('Bronze');
    });

    it('assigns Unranked tier at 50%+ success rate', () => {
      // 10 successes out of 20 = 50%
      for (let i = 0; i < 10; i++) {
        tracker.track('unranked-ability', true, 100);
      }
      for (let i = 0; i < 10; i++) {
        tracker.track('unranked-ability', false, 100);
      }

      const stats = tracker.getStats('unranked-ability');
      expect(stats.successRate).toBe(0.5);
      expect(stats.qualityTier).toBe('Unranked');
    });

    it('assigns Poor tier below 50% success rate', () => {
      // 4 successes out of 10 = 40%
      for (let i = 0; i < 4; i++) {
        tracker.track('poor-ability', true, 100);
      }
      for (let i = 0; i < 6; i++) {
        tracker.track('poor-ability', false, 100);
      }

      const stats = tracker.getStats('poor-ability');
      expect(stats.successRate).toBe(0.4);
      expect(stats.qualityTier).toBe('Poor');
    });

    it('handles edge case at tier boundaries', () => {
      // Test just below Gold threshold (94.9%)
      for (let i = 0; i < 949; i++) {
        tracker.track('almost-gold', true, 100);
      }
      for (let i = 0; i < 51; i++) {
        tracker.track('almost-gold', false, 100);
      }

      const stats = tracker.getStats('almost-gold');
      expect(stats.successRate).toBeCloseTo(0.949, 4);
      expect(stats.qualityTier).toBe('Silver');
    });
  });

  describe('average latency calculation', () => {
    it('calculates average latency correctly', () => {
      tracker.track('ability-lat', true, 100);
      tracker.track('ability-lat', true, 200);
      tracker.track('ability-lat', true, 300);

      const stats = tracker.getStats('ability-lat');
      expect(stats.avgLatency).toBe(200);
    });

    it('includes failed executions in latency calculation', () => {
      tracker.track('mixed-lat', true, 100);
      tracker.track('mixed-lat', false, 300);
      tracker.track('mixed-lat', true, 200);

      const stats = tracker.getStats('mixed-lat');
      expect(stats.avgLatency).toBe(200);
    });

    it('rounds latency to 2 decimal places', () => {
      tracker.track('precise-lat', true, 100);
      tracker.track('precise-lat', true, 101);
      tracker.track('precise-lat', true, 102);

      const stats = tracker.getStats('precise-lat');
      expect(stats.avgLatency).toBe(101);
    });

    it('handles fractional latencies correctly', () => {
      tracker.track('frac-lat', true, 105);
      tracker.track('frac-lat', true, 110);
      tracker.track('frac-lat', true, 111);

      const stats = tracker.getStats('frac-lat');
      // Average: (105 + 110 + 111) / 3 = 108.666...
      expect(stats.avgLatency).toBeCloseTo(108.67, 2);
    });

    it('returns 0 latency for new ability', () => {
      const stats = tracker.getStats('never-tracked');
      expect(stats.avgLatency).toBe(0);
    });
  });

  describe('getStats', () => {
    it('returns correct format', () => {
      tracker.track('test-ability', true, 150);
      tracker.track('test-ability', false, 200);

      const stats = tracker.getStats('test-ability');

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('successful');
      expect(stats).toHaveProperty('avgLatency');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('qualityTier');

      expect(typeof stats.total).toBe('number');
      expect(typeof stats.successful).toBe('number');
      expect(typeof stats.avgLatency).toBe('number');
      expect(typeof stats.successRate).toBe('number');
      expect(typeof stats.qualityTier).toBe('string');
    });

    it('returns zeros for ability never tracked', () => {
      const stats = tracker.getStats('non-existent');

      expect(stats.total).toBe(0);
      expect(stats.successful).toBe(0);
      expect(stats.avgLatency).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.qualityTier).toBe('Poor');
    });

    it('handles single execution correctly', () => {
      tracker.track('single-exec', true, 250);

      const stats = tracker.getStats('single-exec');
      expect(stats.total).toBe(1);
      expect(stats.successful).toBe(1);
      expect(stats.avgLatency).toBe(250);
      expect(stats.successRate).toBe(1.0);
      expect(stats.qualityTier).toBe('Gold');
    });

    it('rounds success rate to 4 decimal places', () => {
      // 2 out of 3 = 0.666666...
      tracker.track('round-test', true, 100);
      tracker.track('round-test', true, 100);
      tracker.track('round-test', false, 100);

      const stats = tracker.getStats('round-test');
      expect(stats.successRate).toBe(0.6667);
    });
  });

  describe('integration scenarios', () => {
    it('handles realistic mixed success/failure pattern', () => {
      const executions = [
        { success: true, latency: 120 },
        { success: true, latency: 95 },
        { success: false, latency: 500 }, // timeout
        { success: true, latency: 110 },
        { success: true, latency: 105 },
        { success: true, latency: 130 },
        { success: false, latency: 450 }, // error
        { success: true, latency: 100 },
        { success: true, latency: 115 },
        { success: true, latency: 108 },
      ];

      for (const exec of executions) {
        tracker.track('realistic', exec.success, exec.latency);
      }

      const stats = tracker.getStats('realistic');
      expect(stats.total).toBe(10);
      expect(stats.successful).toBe(8);
      expect(stats.successRate).toBe(0.8); // 80%
      expect(stats.qualityTier).toBe('Bronze'); // 80% is between 70% and 85%, but < 85% means Bronze
      expect(stats.avgLatency).toBeGreaterThan(100);
      expect(stats.avgLatency).toBeLessThan(200);
    });

    it('tracks deteriorating performance over time', () => {
      // Start with good performance
      for (let i = 0; i < 5; i++) {
        tracker.track('deteriorating', true, 100);
      }
      let stats = tracker.getStats('deteriorating');
      expect(stats.qualityTier).toBe('Gold');

      // Performance degrades
      for (let i = 0; i < 3; i++) {
        tracker.track('deteriorating', false, 200);
      }
      stats = tracker.getStats('deteriorating');
      expect(stats.qualityTier).toBe('Unranked'); // 5/8 = 62.5%

      // Further degradation
      for (let i = 0; i < 5; i++) {
        tracker.track('deteriorating', false, 300);
      }
      stats = tracker.getStats('deteriorating');
      expect(stats.successRate).toBeCloseTo(0.3846, 4); // 5/13
      expect(stats.qualityTier).toBe('Poor');
    });
  });
});
