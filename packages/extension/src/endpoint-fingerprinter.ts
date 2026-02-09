import { createHash } from 'node:crypto';

export function fingerprint(method: string, normalizedPath: string): string {
  return createHash('sha256')
    .update(`${method.toUpperCase()}:${normalizedPath}`)
    .digest('hex');
}
