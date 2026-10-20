import { z } from 'zod';

export interface LandingRestaurant {
  slug: string;
  name: string;
  cuisine: string;
  location: string;
  tagline: string;
  rating: number;
  ratingCount: number;
  logo?: string;
  cover?: string;
  dishCount: number;
}

export interface LandingDish {
  id: string;
  name: string;
  image?: string;
  price: number;
  isVegetarian: boolean;
  restaurantName: string;
  restaurantSlug: string;
  timesOrdered: number;
}

export interface LandingData {
  restaurants: LandingRestaurant[];
  dishes: LandingDish[];
  stats: { restaurants: number; guests: number; orders: number };
}

/** Contact form. `website` is a honeypot: real people never see or fill it. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80),
  email: z.string().trim().toLowerCase().max(120).pipe(z.email('Enter a valid email address.')),
  phone: z.string().trim().max(24).optional(),
  topic: z.enum(['restaurant', 'guest', 'partnership', 'other']).default('restaurant'),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters).').max(2000),
  website: z.string().max(200).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;
