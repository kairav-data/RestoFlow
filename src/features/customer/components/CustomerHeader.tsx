'use client';

import React from 'react';
import { ArrowLeft, Search, ShoppingBag, UserRound } from 'lucide-react';
import { RestaurantBrand } from '@/features/restaurants/components/RestaurantBrand';
import { useCustomer } from '../context/CustomerContext';

interface CustomerHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showCart?: boolean;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showCart = true,
}) => {
  const { restaurant, cartItemCount, setActiveScreen, selectedTable, activeScreen, guest, requireLogin } =
    useCustomer();
  const canGoBack = showBack || activeScreen !== 'home';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {canGoBack && (
            <button
              onClick={onBack || (() => setActiveScreen('home'))}
              className="-ml-1.5 rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          {title ? (
            <h1 className="truncate font-display text-xl font-semibold text-slate-900">{title}</h1>
          ) : (
            <button onClick={() => setActiveScreen('home')} className="min-w-0 text-left" aria-label="Restaurant home">
              <RestaurantBrand name={restaurant.name} logo={restaurant.logo} subtitle={`Table ${selectedTable}`} size="sm" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setActiveScreen('menu')}
            className="rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-200"
            aria-label="Search menu"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => (guest ? undefined : requireLogin())}
            className="flex items-center gap-1.5 rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-200"
            aria-label={guest ? `Signed in as ${guest.name}` : 'Sign in'}
          >
            <UserRound className="h-5 w-5" />
            {guest && <span className="max-w-[4.5rem] truncate pr-1 text-xs font-medium">{guest.name.split(' ')[0]}</span>}
          </button>
          {showCart && (
            <button
              onClick={() => setActiveScreen('cart')}
              className="relative rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
              aria-label={`View cart, ${cartItemCount} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
