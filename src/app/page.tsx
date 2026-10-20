import type { Metadata } from 'next';
import { LandingPage } from '@/features/landing/components/LandingPage';
import { loadLandingData } from '@/server/domain/landing';

// Rebuilt in the background at most once a minute, so visitors get a static-fast page with fresh restaurants and dishes.
export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'RestoFlow: scan, order and track from your table' },
  description:
    'RestoFlow lets guests scan a table QR, browse a photo menu, order, track and pay from their phone, while restaurants run orders, menus and guests from one screen. Based in Mumbai.',
};

export default async function HomePage() {
  const data = await loadLandingData();
  return <LandingPage data={data} />;
}
