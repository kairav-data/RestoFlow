'use client';

import React from 'react';
import { Flame, Plus, Star } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { DishPrice } from '@/features/menu/components/DishPrice';
import { CustomerHeader } from './CustomerHeader';
import { FoodImage } from '@/components/ui/FoodImage';

/** The dishes guests have ordered most over the last two weeks. Counts come from real orders. */
export const PopularNowView: React.FC = () => {
  const { quickAddToCart, setSelectedDish, setActiveScreen, menuItems } = useCustomer();

  const popular = menuItems
    .filter((d) => d.isAvailable && (d.ordersCount ?? 0) > 0)
    .sort((a, b) => (b.ordersCount ?? 0) - (a.ordersCount ?? 0))
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-white pb-28 text-slate-850">
      <CustomerHeader title="Popular now" showBack={true} />

      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        {popular.length === 0 ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <Flame className="mx-auto h-10 w-10 text-slate-300" aria-hidden="true" />
            <h3 className="text-base font-bold text-slate-900">Nothing trending yet</h3>
            <p className="text-xs text-slate-500">Popular dishes appear here once guests start ordering.</p>
            <button
              onClick={() => setActiveScreen('menu')}
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white"
            >
              Browse menu
            </button>
          </div>
        ) : (
          <ol className="space-y-3">
            {popular.map((dish, idx) => (
              <li
                key={dish.id}
                onClick={() => setSelectedDish(dish)}
                className="group flex cursor-pointer items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-subtle transition hover:border-amber-300"
              >
                <span className="w-6 text-center text-sm font-black text-slate-400 transition-colors group-hover:text-amber-600">
                  {idx + 1}
                </span>
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <FoodImage src={dish.image} alt={dish.name} displayWidth={64} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-sm font-bold text-slate-900">{dish.name}</h4>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    {dish.reviewCount > 0 && (
                      <>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="font-bold text-slate-850">{dish.rating}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>{dish.ordersCount} ordered recently</span>
                  </div>
                  <DishPrice dish={dish} className="mt-0.5 block text-xs font-extrabold text-slate-900" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    quickAddToCart(dish);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white transition-transform hover:bg-amber-600 active:scale-90"
                  aria-label={`Add ${dish.name}`}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
};
