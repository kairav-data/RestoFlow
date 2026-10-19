import { RestaurantRoute } from '@/features/restaurants/components/RestaurantRoute';

export default function RestaurantLandingPage({ params }: { params: { slug: string } }) {
  return <RestaurantRoute slug={params.slug} route={{ kind: 'landing' }} />;
}
