import { z } from 'zod';

export const tableInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a table name')
    .max(24, 'Keep it under 24 characters')
    .regex(/^[A-Za-z0-9][A-Za-z0-9 \-_.]*$/, 'Use letters, numbers, spaces or hyphens'),
  capacity: z.number().int().min(1, 'At least 1 seat').max(40, 'Max 40 seats'),
});

export type TableInput = z.infer<typeof tableInputSchema>;
