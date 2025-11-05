/**
 * Tests para el sistema de rate limiting
 */

import { rateLimiter, RateLimitPresets } from '../rate-limiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    // Limpiar el rate limiter antes de cada test
    rateLimiter.reset('test-key');
  });

  describe('canMakeCall', () => {
    it('should allow calls within the limit', () => {
      const key = 'test-user-1';
      const config = { maxCalls: 3, windowMs: 1000 };

      expect(rateLimiter.canMakeCall(key, config)).toBe(true);
      expect(rateLimiter.canMakeCall(key, config)).toBe(true);
      expect(rateLimiter.canMakeCall(key, config)).toBe(true);
    });

    it('should block calls exceeding the limit', () => {
      const key = 'test-user-2';
      const config = { maxCalls: 2, windowMs: 1000 };

      expect(rateLimiter.canMakeCall(key, config)).toBe(true);
      expect(rateLimiter.canMakeCall(key, config)).toBe(true);
      expect(rateLimiter.canMakeCall(key, config)).toBe(false);
    });

    it('should reset after the time window', async () => {
      const key = 'test-user-3';
      const config = { maxCalls: 2, windowMs: 100 }; // 100ms window

      expect(rateLimiter.canMakeCall(key, config)).toBe(true);
      expect(rateLimiter.canMakeCall(key, config)).toBe(true);
      expect(rateLimiter.canMakeCall(key, config)).toBe(false);

      // Esperar a que pase la ventana de tiempo
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(rateLimiter.canMakeCall(key, config)).toBe(true);
    });

    it('should handle different keys independently', () => {
      const config = { maxCalls: 1, windowMs: 1000 };

      expect(rateLimiter.canMakeCall('user-1', config)).toBe(true);
      expect(rateLimiter.canMakeCall('user-2', config)).toBe(true);
      expect(rateLimiter.canMakeCall('user-1', config)).toBe(false);
      expect(rateLimiter.canMakeCall('user-2', config)).toBe(false);
    });
  });

  describe('getTimeUntilReset', () => {
    it('should return 0 when no calls have been made', () => {
      const key = 'test-user-4';
      const config = { maxCalls: 5, windowMs: 1000 };

      expect(rateLimiter.getTimeUntilReset(key, config)).toBe(0);
    });

    it('should return time until reset after a call', () => {
      const key = 'test-user-5';
      const config = { maxCalls: 5, windowMs: 1000 };

      rateLimiter.canMakeCall(key, config);
      const timeUntilReset = rateLimiter.getTimeUntilReset(key, config);

      expect(timeUntilReset).toBeGreaterThan(0);
      expect(timeUntilReset).toBeLessThanOrEqual(1000);
    });
  });

  describe('getStats', () => {
    it('should return correct stats', () => {
      const key = 'test-user-6';
      const config = { maxCalls: 5, windowMs: 1000 };

      let stats = rateLimiter.getStats(key);
      expect(stats.callCount).toBe(0);
      expect(stats.oldestCall).toBeNull();

      rateLimiter.canMakeCall(key, config);
      rateLimiter.canMakeCall(key, config);

      stats = rateLimiter.getStats(key);
      expect(stats.callCount).toBe(2);
      expect(stats.oldestCall).not.toBeNull();
    });
  });

  describe('RateLimitPresets', () => {
    it('should have correct preset configurations', () => {
      expect(RateLimitPresets.STRICT.maxCalls).toBe(5);
      expect(RateLimitPresets.MODERATE.maxCalls).toBe(20);
      expect(RateLimitPresets.RELAXED.maxCalls).toBe(60);
      expect(RateLimitPresets.TICKET_DAILY.windowMs).toBe(86400000);
    });
  });
});
