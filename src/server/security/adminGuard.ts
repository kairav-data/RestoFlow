import 'server-only';
import { HttpError } from '../http';
import { isAdminRequest } from './adminSession';

/** Throws 401 unless the request carries a valid platform-admin session. */
export function requireAdmin(): void {
  if (!isAdminRequest()) throw new HttpError(401, 'Admin sign-in required.');
}
