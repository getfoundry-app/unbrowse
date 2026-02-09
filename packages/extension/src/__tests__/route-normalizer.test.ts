import { describe, it, expect } from 'vitest';
import { normalizeRoute } from '../route-normalizer.js';

describe('normalizeRoute', () => {
  it('replaces numeric IDs', () => {
    expect(normalizeRoute('/users/123')).toBe('/users/{id}');
  });

  it('replaces UUIDs', () => {
    expect(normalizeRoute('/items/550e8400-e29b-41d4-a716-446655440000')).toBe('/items/{id}');
  });

  it('replaces mixed paths with multiple IDs', () => {
    expect(normalizeRoute('/users/123/posts/456')).toBe('/users/{id}/posts/{id}');
  });

  it('replaces hash-like segments', () => {
    expect(normalizeRoute('/assets/a1b2c3d4e5f6a1b2')).toBe('/assets/{id}');
  });

  it('preserves static segments', () => {
    expect(normalizeRoute('/api/v1/users')).toBe('/api/v1/users');
  });

  it('handles root path', () => {
    expect(normalizeRoute('/')).toBe('/');
  });
});
