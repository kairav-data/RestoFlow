import { api } from '@/lib/api';
import type { ContactInput } from '../types';

/** Sends a landing-page enquiry to the RestoFlow team. */
export const sendEnquiry = (input: ContactInput) => api<{ ok: true }>('/api/contact', { method: 'POST', body: input });
