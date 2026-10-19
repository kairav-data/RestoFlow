'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Restaurant, StaffProfile } from '@/features/restaurants/types';
import { RestaurantProvider } from '@/features/restaurants/context/RestaurantContext';
import { OwnerProvider } from './context/OwnerContext';
import { OwnerApp } from './OwnerApp';
import { PortalLogin } from './components/PortalLogin';
import { fetchPortalSession } from './services/ownerAuth';

type Session = { staff: StaffProfile; restaurant: Restaurant };

/** Entry point for /portal/<slug>: gates the dashboard behind a sign-in scoped to this one restaurant. */
export const OwnerPortal: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
  const [state, setState] = useState<'checking' | 'signed-out' | 'signed-in'>('checking');
  const [session, setSession] = useState<Session | null>(null);

  const load = async () => {
    const found = await fetchPortalSession(restaurant.slug);
    setSession(found);
    setState(found ? 'signed-in' : 'signed-out');
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant.slug]);

  if (state === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50" aria-busy="true">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading" />
      </div>
    );
  }

  if (state === 'signed-out' || !session) {
    return <PortalLogin restaurant={restaurant} onSignedIn={() => void load()} />;
  }

  return (
    <RestaurantProvider restaurant={session.restaurant}>
      <OwnerProvider staff={session.staff}>
        <OwnerApp onSignOut={() => setState('signed-out')} />
      </OwnerProvider>
    </RestaurantProvider>
  );
};
