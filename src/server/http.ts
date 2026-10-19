import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/** Error whose message is safe to show to the user. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type Handler<C> = (request: Request, context: C) => Promise<Response>;

/** Rejects cross-site writes: the Origin header of a browser POST must match this host. */
function assertSameOrigin(request: Request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
  const origin = request.headers.get('origin');
  if (!origin) return; // non-browser clients (curl, server-to-server) do not send Origin
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (new URL(origin).host !== host) throw new HttpError(403, 'Cross-site request blocked.');
}

/** Wraps a route handler: origin check, typed error responses, and no leaking of internal errors. */
export function route<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (request, context) => {
    try {
      assertSameOrigin(request);
      return await handler(request, context);
    } catch (err) {
      if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status });
      if (err instanceof ZodError) {
        return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
      }
      console.error(`[api] ${request.method} ${new URL(request.url).pathname}:`, err);
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
  };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'Invalid request body.');
  }
}

export const json = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);
