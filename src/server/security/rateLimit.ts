import 'server-only';

const buckets = new Map<string, number[]>();

/**
 * Naive per-instance sliding-window limiter that protects the AI quota from accidental loops.
 * Use a shared store (Redis) once the app runs on more than one instance.
 */
export function isRateLimited(bucket: string, request: Request, max: number, windowMs = 60_000): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  return recent.length > max;
}
