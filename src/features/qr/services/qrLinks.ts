export interface GuestLinkTarget {
  slug: string;
  table: string;
}

const GUEST_PATH = /^\/r\/([a-z0-9-]+)\/t\/([^/?#]+)\/?$/i;

/** Path a guest opens after scanning a table QR. The table name is part of the URL so any phone can resolve it. */
export function guestPath(slug: string, tableName: string): string {
  return `/r/${slug}/t/${encodeURIComponent(tableName.trim())}`;
}

export function guestUrl(baseUrl: string, slug: string, tableName: string): string {
  return `${baseUrl.replace(/\/+$/, '')}${guestPath(slug, tableName)}`;
}

/**
 * Parses scanned QR text (absolute URL or path). Only returns the slug and table, never the
 * origin, so the app never navigates to a host taken from untrusted QR content.
 */
export function parseGuestLink(input: string): GuestLinkTarget | null {
  const text = input.trim();
  if (!text) return null;
  let pathname: string;
  try {
    pathname = new URL(text, 'https://restoflow.local').pathname;
  } catch {
    return null;
  }
  const match = GUEST_PATH.exec(pathname);
  if (!match) return null;
  try {
    const table = decodeURIComponent(match[2]).trim();
    return table ? { slug: match[1].toLowerCase(), table } : null;
  } catch {
    return null;
  }
}
