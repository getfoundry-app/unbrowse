import { describe, it, expect } from 'vitest';
import { fingerprint } from '../endpoint-fingerprinter.js';

describe('fingerprint', () => {
  it('produces same hash for same method+path', () => {
    const a = fingerprint('GET', '/users/{id}');
    const b = fingerprint('GET', '/users/{id}');
    expect(a).toBe(b);
  });

  it('produces different hashes for different methods', () => {
    const get = fingerprint('GET', '/users/{id}');
    const post = fingerprint('POST', '/users/{id}');
    expect(get).not.toBe(post);
  });

  it('produces different hashes for different paths', () => {
    const a = fingerprint('GET', '/users');
    const b = fingerprint('GET', '/posts');
    expect(a).not.toBe(b);
  });

  it('is deterministic (hex string)', () => {
    const hash = fingerprint('DELETE', '/items/{id}');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(fingerprint('DELETE', '/items/{id}')).toBe(hash);
  });

  it('normalizes method to uppercase', () => {
    expect(fingerprint('get', '/test')).toBe(fingerprint('GET', '/test'));
  });
});
