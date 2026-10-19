import { z } from 'zod';

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'] as const;

export const RESERVED_SLUGS = ['admin', 'portal', 'scan', 'r', 'api'];

export const onboardingSchema = z.object({
  name: z.string().trim().min(2, 'Enter the restaurant name').max(60),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Use at least 3 characters')
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and single hyphens only')
    .refine((v) => !RESERVED_SLUGS.includes(v), 'This code is reserved'),
  cuisine: z.string().trim().min(2, 'Enter the cuisine').max(40),
  tagline: z.string().trim().max(100).optional(),
  description: z.string().trim().max(300).optional(),
  address: z.string().trim().min(5, 'Enter the street address').max(160),
  location: z.string().trim().min(2, 'Enter the city or area').max(60),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,17}$/, 'Enter a valid phone number'),
  operatingHours: z.string().trim().min(3, 'e.g. 11:00 AM - 11:00 PM').max(60),
  currency: z.enum(CURRENCIES),
  tableCount: z.coerce.number().int().min(1, 'At least 1 table').max(200),
  ownerName: z.string().trim().min(2, 'Enter the owner name').max(60),
  ownerEmail: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters').max(64),
});

export type OnboardingInput = z.input<typeof onboardingSchema>;
export type OnboardingValues = z.output<typeof onboardingSchema>;
