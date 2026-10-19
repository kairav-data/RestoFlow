import { NextResponse } from 'next/server';
import { describeRequestSchema, describeResponseSchema } from '@/features/menu/types';
import { AiError, generateStructured } from '@/server/ai';
import { isRateLimited } from '@/server/security/rateLimit';
import { requireStaffSession } from '@/server/security/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SCHEMA = {
  type: 'object',
  properties: {
    descriptions: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, description: { type: 'string' } },
        required: ['name', 'description'],
      },
    },
  },
  required: ['descriptions'],
};

const OUTPUT_HINT = '{"descriptions":[{"name":string (exactly as given),"description":string}]}';

/** Writes short menu descriptions from dish names alone. */
export async function POST(request: Request) {
  // AI calls cost money: only signed-in restaurant staff may make them.
  try {
    requireStaffSession();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Please sign in again.' }, { status: 401 });
  }
  if (isRateLimited('menu-describe', request, 20)) {
    return NextResponse.json({ error: 'Too many requests. Wait a minute and try again.' }, { status: 429 });
  }
  const parsed = describeRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  const list = parsed.data.dishes
    .map((d) => `- ${d.name}${d.category ? ` (${d.category})` : ''}${d.isVegetarian === undefined ? '' : d.isVegetarian ? ' [vegetarian]' : ' [non-vegetarian]'}`)
    .join('\n');
  const prompt = [
    'You write menu descriptions for a restaurant. For each dish below write ONE appetising description of 12 to 22 words.',
    'Rules:',
    '- Describe only what the dish name and your culinary knowledge of that dish imply: main ingredients, cooking method, taste, how it is served.',
    '- Do not invent origins, awards, health claims, spice heat, allergen statements or portion sizes.',
    '- No emoji, no exclamation marks, no quotation marks, no repeating the dish name at the start.',
    '- Return one entry per dish, with the name exactly as given.',
    `Dishes:\n${list}`,
  ].join('\n');

  try {
    const raw = await generateStructured({ prompt, schema: SCHEMA, outputHint: OUTPUT_HINT });
    const checked = describeResponseSchema.safeParse(raw);
    if (!checked.success) {
      return NextResponse.json({ error: 'The AI could not write descriptions. Try again.' }, { status: 422 });
    }
    // Models sometimes decorate the echoed name ("Dish (Mains) [vegetarian]"), so re-key results to the requested names.
    const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const out = parsed.data.dishes.flatMap((dish, i) => {
      const want = norm(dish.name);
      const hit =
        checked.data.descriptions.find((d) => norm(d.name) === want) ??
        checked.data.descriptions.find((d) => norm(d.name).startsWith(want)) ??
        (checked.data.descriptions.length === parsed.data.dishes.length ? checked.data.descriptions[i] : undefined);
      return hit ? [{ name: dish.name, description: hit.description }] : [];
    });
    return NextResponse.json({ descriptions: out });
  } catch (err) {
    if (err instanceof AiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: 'Writing descriptions failed. Try again.' }, { status: 500 });
  }
}
