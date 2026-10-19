'use client';

import React from 'react';
import type { Restaurant } from '@/features/restaurants/types';
import { RestaurantProvider } from '@/features/restaurants/context/RestaurantContext';
import { CustomerProvider } from './context/CustomerContext';
import { CustomerApp } from './CustomerApp';

/** What a guest sees after scanning a table QR: the restaurant's own menu and ordering flow. */
export const GuestExperience: React.FC<{ restaurant: Restaurant; tableName: string }> = ({ restaurant, tableName }) => (
  <RestaurantProvider restaurant={restaurant}>
    <CustomerProvider tableName={tableName}>
      <CustomerApp />
    </CustomerProvider>
  </RestaurantProvider>
);
