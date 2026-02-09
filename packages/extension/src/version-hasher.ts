/**
 * Version Hasher
 * Content-addressable hashing for skill version tracking and deduplication.
 */

import { createHash } from 'node:crypto';

export function hashSkill(skillMd: string, apiTs: string): string {
  const content = `${skillMd}\n---\n${apiTs}`;
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}
