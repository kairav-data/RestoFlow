'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { OwnerPortal } from '@/features/owner/OwnerPortal';
import { GuestExperience } from '@/features/customer/GuestExperience';
import { useRestaurantBySlug } from '../hooks';
import { RestaurantLanding } from './RestaurantLanding';

type RouteKind = { kind: 'portal' } | { kind: 'landing' } | { kind: 'guest'; tableName: string };

/** Loads a restaurant from the API and renders the portal, QR landing page or guest ordering experience. */
export const RestaurantRoute: React.FC<{ slug: string; route: RouteKind }> = ({ slug, route }) => {
  const state = useRestaurantBySlug(slug, route.kind === 'guest');

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50" aria-busy="true">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading" />
      </div>
    );
  }

  if (state.status !== 'ready') {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          {state.status === 'missing' ? 'Restaurant not found' : 'Something went wrong'}
        </h1>
        <p className="text-sm text-slate-600">
          {state.status === 'missing'
            ? `We could not find a restaurant with the code “${slug}”. Check the QR card or ask the staff.`
            : state.message}
        </p>
        <Link href="/" className="text-sm font-semibold text-amber-700 hover:underline">
          Back to RestoFlow
        </Link>
      </main>
    );
  }

  const { restaurant } = state;
  if (route.kind === 'portal') return <OwnerPortal restaurant={restaurant} />;
  if (route.kind === 'guest') return <GuestExperience restaurant={restaurant} tableName={route.tableName} />;
  return <RestaurantLanding restaurant={restaurant} />;
};
