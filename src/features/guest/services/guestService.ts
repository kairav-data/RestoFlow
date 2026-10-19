import { api } from '@/lib/api';

export interface GuestProfile {
  id: string;
  name: string;
  phone: string;
}

/** The guest's session lives in an httpOnly cookie set by the server; this only reads who is signed in. */
export async function fetchGuest(): Promise<GuestProfile | null> {
  try {
    return (await api<{ customer: GuestProfile | null }>('/api/customer/me')).customer;
  } catch {
    return null;
  }
}

/** Sends a six-digit code by SMS. In local development without an SMS provider the code is returned as `devCode`. */
export function requestOtp(phone: string) {
  return api<{ ok: true; phone: string; devCode?: string }>('/api/customer/otp/request', { method: 'POST', body: { phone } });
}

export async function verifyOtp(phone: string, code: string, name?: string): Promise<GuestProfile> {
  return (await api<{ customer: GuestProfile }>('/api/customer/otp/verify', { method: 'POST', body: { phone, code, name } })).customer;
}

export async function signOutGuest(): Promise<void> {
  await api('/api/customer/logout', { method: 'POST' }).catch(() => undefined);
}

export function maskPhone(phone: string): string {
  return `xxxxxx${phone.slice(-4)}`;
}
