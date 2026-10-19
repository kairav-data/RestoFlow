import type { Metadata } from 'next';
import { RestaurantRoute } from '@/features/restaurants/components/RestaurantRoute';

export const metadata: Metadata = { title: 'Restaurant portal' };

export default function RestaurantPortalPage({ params }: { params: { slug: string } }) {
  return <RestaurantRoute slug={params.slug} route={{ kind: 'portal' }} />;
}
