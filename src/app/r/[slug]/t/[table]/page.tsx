import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RestaurantRoute } from '@/features/restaurants/components/RestaurantRoute';

type Params = { params: { slug: string; table: string } };

function decodeTable(raw: string): string {
  try {
    return decodeURIComponent(raw).trim().slice(0, 24);
  } catch {
    return '';
  }
}

export const metadata: Metadata = { title: 'Menu' };

/** Target of every table QR: /r/<restaurant>/t/<table name>. */
export default function GuestTablePage({ params }: Params) {
  const tableName = decodeTable(params.table);
  if (!tableName) notFound();
  return <RestaurantRoute slug={params.slug} route={{ kind: 'guest', tableName }} />;
}
