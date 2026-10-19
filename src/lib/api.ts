export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** JSON fetch for the app's own API. Sends cookies, throws ApiError with a user-safe message on failure. */
export async function api<T>(path: string, init?: Omit<RequestInit, 'body'> & { body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      cache: 'no-store',
      headers: { ...(init?.body !== undefined ? { 'content-type': 'application/json' } : {}), ...init?.headers },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string } | null)?.error || 'Something went wrong. Please try again.');
  }
  return data as T;
}
