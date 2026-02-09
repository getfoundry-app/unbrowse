const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_RE = /^\d+$/;
const HASH_RE = /^[0-9a-f]{16,}$/i;
const SLUG_WITH_ID_RE = /^.*-[0-9a-f]{6,}$/i;

function isDynamicSegment(segment: string): boolean {
  if (NUMERIC_RE.test(segment)) return true;
  if (UUID_RE.test(segment)) return true;
  if (HASH_RE.test(segment)) return true;
  if (SLUG_WITH_ID_RE.test(segment)) return true;
  return false;
}

export function normalizeRoute(path: string): string {
  return path
    .split('/')
    .map(segment => (segment && isDynamicSegment(segment) ? '{id}' : segment))
    .join('/');
}
