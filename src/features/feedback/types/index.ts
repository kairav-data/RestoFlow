import { z } from 'zod';

export const SUGGESTION_TOPICS = [
  'Menu & new dishes',
  'Service',
  'Ambience',
  'Pricing',
  'Cleanliness',
  'Wait time',
] as const;

const star = z.number().int().min(1).max(5);

export const feedbackInputSchema = z.object({
  overallRating: star,
  serviceRating: star,
  ambienceRating: star,
  valueRating: star,
  dishRatings: z
    .array(
      z.object({
        dishId: z.string().min(1),
        dishName: z.string().min(1),
        rating: star,
        note: z.string().trim().max(200).optional(),
      }),
    )
    .max(30),
  suggestionTopics: z.array(z.enum(SUGGESTION_TOPICS)).max(SUGGESTION_TOPICS.length),
  suggestion: z.string().trim().max(1000),
  wouldRecommend: z.boolean(),
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;

export interface GuestFeedback extends FeedbackInput {
  id: string;
  restaurantSlug: string;
  tableName: string;
  guestName: string;
  /** Masked, e.g. "xxxxxx4521". Full numbers never leave the guest session. */
  guestPhone: string;
  createdAt: string;
}
