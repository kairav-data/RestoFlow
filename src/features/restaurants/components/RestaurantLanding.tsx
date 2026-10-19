import React from 'react';
import Link from 'next/link';
import { ScanLine } from 'lucide-react';
import type { Restaurant } from '../types';
import { RestaurantBrand } from './RestaurantBrand';

/** A restaurant link without a table: ask the guest to scan the QR on their table. */
export const RestaurantLanding: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => (
  <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-10 text-center">
    <RestaurantBrand
      name={restaurant.name}
      logo={restaurant.logo}
      subtitle={restaurant.location}
      size="lg"
      className="justify-center"
    />
    <h1 className="text-3xl font-semibold text-slate-900">Scan the QR on your table</h1>
    <p className="text-sm text-slate-600">
      Each table has its own QR code. Scan it to open the {restaurant.name} menu and order from your seat.
    </p>
    <Link
      href="/scan"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3.5 text-sm font-semibold text-white hover:bg-amber-400"
    >
      <ScanLine className="h-5 w-5" /> Open QR scanner
    </Link>
  </main>
);
