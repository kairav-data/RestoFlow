import { NextResponse } from 'next/server';
import { extractRequestSchema, extractResponseSchema, SPICE_LEVELS } from '@/features/menu/types';
import { AiError, generateStructured } from '@/server/ai';
import { isRateLimited } from '@/server/security/rateLimit';
import { requireStaffSession } from '@/server/security/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MENU_SCHEMA = {
  type: 'object',
  properties: {
    dishes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Dish name exactly as printed, in title case.' },
          description: { type: 'string', description: 'Printed description. Empty string if none is printed.' },
          price: { type: ['number', 'null'], description: 'Price as a plain number. null if not printed.' },
          halfPrice: { type: ['number', 'null'], description: 'Half-plate price if the menu lists a half portion, else null.' },
          categoryId: { type: ['string', 'null'], description: 'id of the best matching category, or null.' },
          isVegetarian: { type: 'boolean', description: 'True only if a vegetarian marking or ingredients make it clear.' },
          spiceLevel: { type: 'string', enum: [...SPICE_LEVELS] },
          confidence: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'low when text is blurry, cut off, or the name or price is partly guessed.',
          },
        },
        required: ['name', 'description', 'price', 'halfPrice', 'categoryId', 'isVegetarian', 'spiceLevel', 'confidence'],
      },
    },
  },
  required: ['dishes'],
};

const OUTPUT_HINT = `{"dishes":[{"name":string,"description":string (empty if none),"price":number|null (the FULL plate price),"halfPrice":number|null,"categoryId":string|null,"isVegetarian":boolean,"spiceLevel":"mild"|"medium"|"spicy"|"extra-spicy","confidence":"high"|"medium"|"low"}]}`;

export async function POST(request: Request) {
  // AI calls cost money: only signed-in restaurant staff may make them.
  try {
    requireStaffSession();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Please sign in again.' }, { status: 401 });
  }
  if (isRateLimited('menu-extract', request, 8)) {
    return NextResponse.json({ error: 'Too many scans. Wait a minute and try again.' }, { status: 429 });
  }

  const parsed = extractRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }

  const { image, categories } = parsed.data;
  const [header, data] = image.split(',');
  const mimeType = header.slice(5, header.indexOf(';'));

  const prompt = [
    'This is a photo of a restaurant menu. Read it and return every dish on it.',
    'Rules:',
    '- Only include dishes actually printed. Never invent dishes, prices or descriptions.',
    '- Ignore section headings, taglines, addresses, phone numbers and offers.',
    '- If a dish lists Half and Full plate prices, put the Full price in price and the Half price in halfPrice. Otherwise halfPrice is null.',
    '- If it shows other sizes or prices, use the lowest as price.',
    '- Prices are plain numbers without currency symbols.',
    '- Mark confidence "low" for anything you could not read clearly.',
    `Categories (use the id):\n${categories.map((c) => `- ${c.id}: ${c.name}`).join('\n')}`,
  ].join('\n');

  try {
    const raw = await generateStructured({ prompt, image: { mimeType, base64: data }, schema: MENU_SCHEMA, outputHint: OUTPUT_HINT });
    const checked = extractResponseSchema.safeParse(raw);
    if (!checked.success) {
      console.error('[menu-extract] output failed validation:', JSON.stringify(checked.error.issues.slice(0, 3)), JSON.stringify(raw).slice(0, 300));
      return NextResponse.json({ error: 'We could not find a readable menu in this photo.' }, { status: 422 });
    }
    const validIds = new Set(categories.map((c) => c.id));
    const dishes = checked.data.dishes.map((d) => ({
      ...d,
      categoryId: d.categoryId && validIds.has(d.categoryId) ? d.categoryId : null,
    }));
    return NextResponse.json({ dishes });
  } catch (err) {
    if (err instanceof AiError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: 'Menu scanning failed. Try again.' }, { status: 500 });
  }
}
