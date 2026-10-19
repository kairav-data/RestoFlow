import { describeResponseSchema, type DescribeRequest } from '../types';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Asks the AI to write descriptions from dish names. Returns a map keyed by normalised dish name. */
export async function describeDishes(dishes: DescribeRequest['dishes']): Promise<Map<string, string>> {
  const res = await fetch('/api/menu/describe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ dishes: dishes.slice(0, 40) }),
  });
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new Error((json as { error?: string } | null)?.error || 'Writing descriptions failed.');
  const map = new Map<string, string>();
  for (const d of describeResponseSchema.parse(json).descriptions) map.set(norm(d.name), d.description);
  return map;
}

export const descriptionKey = norm;
