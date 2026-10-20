import { api } from '@/lib/api';

export interface GuestProfile {
  id: string;
  name: string;
  email: string | null;
}

/** The guest's session lives in an httpOnly cookie set by the server; this only reads who is signed in. */
export async function fetchGuest(): Promise<GuestProfile | null> {
  try {
    return (await api<{ customer: GuestProfile | null }>('/api/customer/me')).customer;
  } catch {
    return null;
  }
}

/** Emails a six-digit code. In local development without an email provider the code is returned as `devCode`. */
export function requestOtp(email: string) {
  return api<{ ok: true; email: string; devCode?: string }>('/api/customer/otp/request', { method: 'POST', body: { email } });
}

export async function verifyOtp(email: string, code: string, name?: string): Promise<GuestProfile> {
  return (await api<{ customer: GuestProfile }>('/api/customer/otp/verify', { method: 'POST', body: { email, code, name } })).customer;
}

export async function signOutGuest(): Promise<void> {
  await api('/api/customer/logout', { method: 'POST' }).catch(() => undefined);
}

export function maskEmail(email: string): string {
  const [local, domain = ''] = email.split('@');
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
}
