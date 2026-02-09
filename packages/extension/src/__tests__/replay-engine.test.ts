import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReplayEngine } from '../replay-engine.js';
import type { ApiEndpoint, AuthInfo } from '../types.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('ReplayEngine', () => {
  let engine: ReplayEngine;
  let mockEndpoint: ApiEndpoint;
  let mockAuth: AuthInfo;

  beforeEach(() => {
    engine = new ReplayEngine();
    mockEndpoint = {
      method: 'GET',
      path: '/api/users',
      originalPath: 'https://api.example.com/api/users',
      fingerprint: 'get-api-users',
    };
    mockAuth = {
      method: 'bearer',
      headers: { Authorization: 'Bearer test-token' },
      cookies: {},
      tokens: ['test-token'],
    };
    vi.clearAllMocks();
  });

  describe('successful replay', () => {
    it('returns data and timing for successful request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ users: [{ id: 1, name: 'John' }] }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await engine.replay(mockEndpoint, mockAuth);

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ users: [{ id: 1, name: 'John' }] });
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.latencyMs).toBe('number');
    });

    it('measures latency accurately', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' }),
      };
      (global.fetch as any).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockResponse), 50);
        });
      });

      const result = await engine.replay(mockEndpoint, mockAuth);

      expect(result.latencyMs).toBeGreaterThanOrEqual(40); // Allow some timing variance
      expect(result.latencyMs).toBeLessThan(200);
    });

    it('includes auth headers in request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await engine.replay(mockEndpoint, mockAuth);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/users',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('uses correct HTTP method', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue({ id: 123 }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const postEndpoint: ApiEndpoint = {
        method: 'POST',
        path: '/api/users',
        originalPath: 'https://api.example.com/api/users',
        fingerprint: 'post-api-users',
      };

      await engine.replay(postEndpoint, mockAuth, { name: 'Alice' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Alice' }),
        })
      );
    });

    it('includes body for POST requests', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue({ created: true }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const postEndpoint: ApiEndpoint = {
        method: 'POST',
        path: '/api/data',
        originalPath: 'https://api.example.com/api/data',
        fingerprint: 'post-api-data',
      };

      const params = { key: 'value', number: 42 };
      await engine.replay(postEndpoint, mockAuth, params);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(params),
        })
      );
    });

    it('omits body for GET requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await engine.replay(mockEndpoint, mockAuth, { ignored: 'params' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          body: undefined,
        })
      );
    });

    it('handles JSON response', async () => {
      const mockData = { users: [1, 2, 3], total: 3 };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await engine.replay(mockEndpoint, mockAuth);

      expect(result.data).toEqual(mockData);
    });

    it('handles text response when JSON parsing fails', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new Error('Not JSON')),
        text: vi.fn().mockResolvedValue('plain text response'),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await engine.replay(mockEndpoint, mockAuth);

      expect(result.data).toBe('plain text response');
    });

    it('handles empty response', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        json: vi.fn().mockRejectedValue(new Error('No content')),
        text: vi.fn().mockRejectedValue(new Error('No content')),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await engine.replay(mockEndpoint, mockAuth);

      expect(result.status).toBe(204);
      expect(result.data).toBeNull();
    });
  });

  describe('success tracking', () => {
    it('tracks successful execution', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await engine.replay(mockEndpoint, mockAuth);

      const healthScore = engine.getHealthScore(mockEndpoint.fingerprint);
      expect(healthScore).toBe(1.0);
    });

    it('updates health score after multiple successes', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      for (let i = 0; i < 5; i++) {
        await engine.replay(mockEndpoint, mockAuth);
      }

      const healthScore = engine.getHealthScore(mockEndpoint.fingerprint);
      expect(healthScore).toBe(1.0);
    });

    it('counts 2xx status codes as success', async () => {
      for (const status of [200, 201, 202, 204]) {
        const mockResponse = {
          ok: true,
          status,
          json: vi.fn().mockResolvedValue({}),
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        await engine.replay(mockEndpoint, mockAuth);
      }

      const healthScore = engine.getHealthScore(mockEndpoint.fingerprint);
      expect(healthScore).toBe(1.0);
    });

    it('counts 3xx status codes as success', async () => {
      const mockResponse = {
        ok: false,
        status: 302,
        json: vi.fn().mockResolvedValue({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await engine.replay(mockEndpoint, mockAuth);

      const healthScore = engine.getHealthScore(mockEndpoint.fingerprint);
      expect(healthScore).toBe(1.0);
    });

    it('returns 1.0 health score for never-called endpoint', () => {
      const healthScore = engine.getHealthScore('never-called');
      expect(healthScore).toBe(1.0);
    });
  });

  describe('failure handling', () => {
    it('handles 4xx errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ error: 'Not found' }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await engine.replay(mockEndpoint, mockAuth);

      expect(result.status).toBe(404);
      expect(result.data).toEqual({ error: 'Not found' });
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('handles 5xx errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: 'Internal server error' }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const result = await engine.replay(mockEndpoint, mockAuth);

      expect(result.status).toBe(500);
      expect(result.data).toEqual({ error: 'Internal server error' });
    });

    it('tracks failures in health score', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      await engine.replay(mockEndpoint, mockAuth);

      const healthScore = engine.getHealthScore(mockEndpoint.fingerprint);
      expect(healthScore).toBe(0);
    });

    it('calculates health score from mixed results', async () => {
      // 3 successes
      for (let i = 0; i < 3; i++) {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({}),
        });
        await engine.replay(mockEndpoint, mockAuth);
      }

      // 1 failure
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      });
      await engine.replay(mockEndpoint, mockAuth);

      const healthScore = engine.getHealthScore(mockEndpoint.fingerprint);
      expect(healthScore).toBe(0.75); // 3/4
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      await expect(engine.replay(mockEndpoint, mockAuth)).rejects.toThrow('Network error');
    });

    it('handles timeout errors', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Request timeout'));

      await expect(engine.replay(mockEndpoint, mockAuth)).rejects.toThrow('Request timeout');
    });

    it('preserves error information in response', async () => {
      const errorResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          error: 'Bad request',
          details: 'Missing required field',
        }),
      };
      (global.fetch as any).mockResolvedValue(errorResponse);

      const result = await engine.replay(mockEndpoint, mockAuth);

      expect(result.status).toBe(400);
      expect(result.data).toHaveProperty('error');
      expect(result.data).toHaveProperty('details');
    });
  });

  describe('auth refresh on 401', () => {
    it('attempts auth refresh on 401 response', async () => {
      const authWithRefresh: AuthInfo = {
        method: 'bearer',
        headers: { Authorization: 'Bearer old-token' },
        cookies: {},
        tokens: ['old-token'],
        refreshConfig: {
          endpoint: 'https://api.example.com/auth/refresh',
          method: 'POST',
          body: { refresh_token: 'refresh-token' },
        },
      };

      // First call returns 401
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ error: 'Unauthorized' }),
      });

      // Refresh call succeeds
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ access_token: 'new-token' }),
      });

      // Retry call succeeds
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'success' }),
      });

      const result = await engine.replay(mockEndpoint, authWithRefresh);

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ data: 'success' });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('updates auth headers after successful refresh', async () => {
      const authWithRefresh: AuthInfo = {
        method: 'bearer',
        headers: { Authorization: 'Bearer old-token' },
        cookies: {},
        tokens: ['old-token'],
        refreshConfig: {
          endpoint: 'https://api.example.com/auth/refresh',
          method: 'POST',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({}),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ access_token: 'new-shiny-token' }),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      await engine.replay(mockEndpoint, authWithRefresh);

      expect(authWithRefresh.headers.Authorization).toBe('Bearer new-shiny-token');
      expect(authWithRefresh.tokens[0]).toBe('new-shiny-token');
    });

    it('does not retry if refresh fails', async () => {
      const authWithRefresh: AuthInfo = {
        method: 'bearer',
        headers: { Authorization: 'Bearer old-token' },
        cookies: {},
        tokens: ['old-token'],
        refreshConfig: {
          endpoint: 'https://api.example.com/auth/refresh',
          method: 'POST',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ error: 'Unauthorized' }),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: vi.fn().mockResolvedValue({ error: 'Refresh failed' }),
      });

      const result = await engine.replay(mockEndpoint, authWithRefresh);

      expect(result.status).toBe(401);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('does not attempt refresh if no refreshConfig', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ error: 'Unauthorized' }),
      });

      const result = await engine.replay(mockEndpoint, mockAuth);

      expect(result.status).toBe(401);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('handles different token field names in refresh response', async () => {
      const authWithRefresh: AuthInfo = {
        method: 'bearer',
        headers: { Authorization: 'Bearer old-token' },
        cookies: {},
        tokens: ['old-token'],
        refreshConfig: {
          endpoint: 'https://api.example.com/auth/refresh',
          method: 'POST',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({}),
      });

      // Test with 'token' field
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ token: 'new-token-variant' }),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      await engine.replay(mockEndpoint, authWithRefresh);

      expect(authWithRefresh.headers.Authorization).toBe('Bearer new-token-variant');
    });

    it('adjusts health score correctly after refresh retry', async () => {
      const authWithRefresh: AuthInfo = {
        method: 'bearer',
        headers: { Authorization: 'Bearer old-token' },
        cookies: {},
        tokens: ['old-token'],
        refreshConfig: {
          endpoint: 'https://api.example.com/auth/refresh',
          method: 'POST',
        },
      };

      // 401, then refresh, then success
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({}),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ access_token: 'new-token' }),
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      await engine.replay(mockEndpoint, authWithRefresh);

      // Should count as success after refresh
      const healthScore = engine.getHealthScore(mockEndpoint.fingerprint);
      expect(healthScore).toBe(1.0);
    });
  });

  describe('different HTTP methods', () => {
    it('handles PUT requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ updated: true }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const putEndpoint: ApiEndpoint = {
        method: 'PUT',
        path: '/api/users/1',
        originalPath: 'https://api.example.com/api/users/1',
        fingerprint: 'put-api-users-id',
      };

      await engine.replay(putEndpoint, mockAuth, { name: 'Updated' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        })
      );
    });

    it('handles PATCH requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ patched: true }),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const patchEndpoint: ApiEndpoint = {
        method: 'PATCH',
        path: '/api/users/1',
        originalPath: 'https://api.example.com/api/users/1',
        fingerprint: 'patch-api-users-id',
      };

      await engine.replay(patchEndpoint, mockAuth, { status: 'active' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'active' }),
        })
      );
    });

    it('handles DELETE requests', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        json: vi.fn().mockRejectedValue(new Error('No content')),
        text: vi.fn().mockRejectedValue(new Error('No content')),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const deleteEndpoint: ApiEndpoint = {
        method: 'DELETE',
        path: '/api/users/1',
        originalPath: 'https://api.example.com/api/users/1',
        fingerprint: 'delete-api-users-id',
      };

      const result = await engine.replay(deleteEndpoint, mockAuth);

      expect(result.status).toBe(204);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('handles case-insensitive method names', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const mixedCaseEndpoint: ApiEndpoint = {
        method: 'GeT',
        path: '/api/test',
        originalPath: 'https://api.example.com/api/test',
        fingerprint: 'get-api-test',
      };

      await engine.replay(mixedCaseEndpoint, mockAuth);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GeT',
        })
      );
    });
  });
});
