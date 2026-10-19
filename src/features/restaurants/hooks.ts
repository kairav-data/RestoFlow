'use client';

import { useEffect, useState } from 'react';
import type { Restaurant } from './types';
import { fetchRestaurant } from './services/restaurantService';

export type RestaurantState =
  | { status: 'loading' }
  | { status: 'ready'; restaurant: Restaurant }
  | { status: 'missing' }
  | { status: 'error'; message: string };

/** Loads a restaurant by its code. `withMenu` is for the guest experience. */
export function useRestaurantBySlug(slug: string, withMenu = false): RestaurantState {
  const [state, setState] = useState<RestaurantState>({ status: 'loading' });
  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    fetchRestaurant(slug, withMenu)
      .then((restaurant) => !cancelled && setState(restaurant ? { status: 'ready', restaurant } : { status: 'missing' }))
      .catch((err) => !cancelled && setState({ status: 'error', message: err instanceof Error ? err.message : 'Could not load.' }));
    return () => {
      cancelled = true;
    };
  }, [slug, withMenu]);
  return state;
}
