'use client';

import React from 'react';
import { BookOpen, ChevronRight, Clock, Dices, Flame, Heart, MapPin, Plus, Sparkles, Star } from 'lucide-react';
import { DishPrice } from '@/features/menu/components/DishPrice';
import { formatCurrency } from '@/lib/utils';
import { useCustomer } from '../context/CustomerContext';
import { CustomerHeader } from './CustomerHeader';
import { FoodImage } from '@/components/ui/FoodImage';

export const CustomerHome: React.FC = () => {
  const {
    restaurant,
    menuItems,
    categories,
    setActiveScreen,
    addToCart, quickAddToCart,
    setSelectedDish,
    setFilters,
    favoriteDishIds,
    toggleFavorite,
    selectedTable,
    guest,
  } = useCustomer();

  const specials = menuItems.filter((i) => i.isChefSpecial || i.isMostOrdered).slice(0, 4);

  const openMenu = (category = 'all') => {
    setFilters((prev) => ({ ...prev, category }));
    setActiveScreen('menu');
  };

  const actions = [
    { label: 'View menu', hint: 'Everything we serve', icon: BookOpen, onClick: () => openMenu() },
    { label: 'Help me choose', hint: 'Tell us your mood', icon: Sparkles, accent: true, onClick: () => setActiveScreen('help-me-choose') },
    { label: 'Popular now', hint: 'Most ordered today', icon: Flame, onClick: () => setActiveScreen('popular') },
    {
      label: 'Surprise me',
      hint: 'We pick for you',
      icon: Dices,
      onClick: () => setSelectedDish(menuItems[Math.floor(Math.random() * menuItems.length)]),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      <CustomerHeader />

      <main className="mx-auto max-w-md space-y-7 px-4 py-4">
        <section className="relative overflow-hidden rounded-xl bg-obsidian-900 text-white">
          <FoodImage src={restaurant.heroImage} displayWidth={448} priority className="absolute inset-0 h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/50 to-transparent" />
          <div className="relative flex min-h-[15rem] flex-col justify-end gap-3 p-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-200">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <strong className="text-white">{restaurant.rating}</strong> ({restaurant.totalReviews} reviews)
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-amber-400" /> {restaurant.location}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
                {guest ? `Welcome, ${guest.name.split(' ')[0]}` : `Welcome to ${restaurant.name}`}
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold leading-tight">{restaurant.heroSubtitle}</h2>
              <p className="mt-1 text-sm text-slate-300">{restaurant.heroDescription}</p>
            </div>
            <div className="flex items-center justify-between border-t border-white/15 pt-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Clock className="h-3.5 w-3.5 text-amber-400" /> {restaurant.operatingHours}
              </span>
              <span className="rounded-full bg-amber-500 px-3 py-1 font-semibold text-white">Table {selectedTable}</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3" aria-label="Quick actions">
          {actions.map(({ label, hint, icon: Icon, onClick, accent }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex flex-col items-start rounded-xl border p-4 text-left transition-colors active:scale-[0.98] ${
                accent ? 'border-amber-300 bg-amber-50 hover:border-amber-400' : 'border-slate-200 bg-white hover:border-amber-300'
              }`}
            >
              <span
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                  accent ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="text-sm font-semibold text-slate-900">{label}</span>
              <span className="mt-0.5 text-xs text-slate-500">{hint}</span>
            </button>
          ))}
        </section>

        {specials.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">Chef&apos;s specials</h3>
              <button onClick={() => openMenu()} className="flex items-center gap-0.5 text-sm font-medium text-amber-700">
                View all <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {specials.map((dish) => (
                <article
                  key={dish.id}
                  onClick={() => setSelectedDish(dish)}
                  className="group flex w-44 shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="relative h-28 overflow-hidden bg-slate-100">
                    <FoodImage src={dish.image} alt={dish.name} displayWidth={176} className="h-full w-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(dish.id);
                      }}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
                      aria-label={favoriteDishIds.includes(dish.id) ? 'Remove from favourites' : 'Save to favourites'}
                    >
                      <Heart className={`h-4 w-4 ${favoriteDishIds.includes(dish.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-2 p-3">
                    <div>
                      <h4 className="line-clamp-1 text-sm font-semibold">{dish.name}</h4>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {dish.rating}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <DishPrice dish={dish} className="text-sm font-semibold" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          quickAddToCart(dish);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white transition-transform active:scale-90"
                        aria-label={`Add ${dish.name} to cart`}
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h3 className="font-display text-xl font-semibold">Browse by category</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => openMenu(cat.id)}
                className="group flex flex-col items-center rounded-xl border border-slate-200 bg-white p-2 text-center transition-colors hover:border-amber-300 active:scale-95"
              >
                <span className="mb-1.5 h-16 w-full overflow-hidden rounded-lg bg-slate-100">
                  <FoodImage src={cat.image} displayWidth={120} className="h-full w-full object-cover" />
                </span>
                <span className="line-clamp-1 text-xs font-semibold text-slate-800">{cat.name}</span>
                <span className="text-[11px] text-slate-500">{menuItems.filter((m) => m.category === cat.id).length} items</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
