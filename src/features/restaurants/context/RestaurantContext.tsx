'use client';

import React, { createContext, useContext } from 'react';
import type { Restaurant } from '../types';

const RestaurantContext = createContext<Restaurant | undefined>(undefined);

export const RestaurantProvider: React.FC<{
  restaurant: Restaurant;
  children: React.ReactNode;
}> = ({ restaurant, children }) => (
  <RestaurantContext.Provider value={restaurant}>{children}</RestaurantContext.Provider>
);

export const useRestaurant = (): Restaurant => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within a RestaurantProvider');
  return ctx;
};
