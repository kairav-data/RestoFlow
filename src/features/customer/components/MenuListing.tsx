'use client';

import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { SlidersHorizontal, Search, Leaf, Beef } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { CustomerHeader } from './CustomerHeader';
import { DishCard } from './DishCard';
import type { MenuItem } from '@/types';

/** Cards rendered up front; more are added just before the guest scrolls to the end. */
const BATCH = 24;
/** Cards near the top whose photos load immediately instead of lazily. */
const PRIORITY_IMAGES = 4;

export const MenuListing: React.FC = () => {
  const { menuItems: MENU_ITEMS, categories: MENU_CATEGORIES } = useCustomer();
  const {
    filters: liveFilters,
    setFilters,
    setIsFilterSheetOpen,
    quickAddToCart,
    setSelectedDish,
    favoriteDishIds,
    toggleFavorite,
    cart,
  } = useCustomer();

  // Typing stays instant: the list re-filters a moment later, at lower priority, instead of on every keystroke.
  const filters = useDeferredValue(liveFilters);

  // Stable handlers so memoised cards do not re-render when unrelated state changes.
  const latest = useRef({ setSelectedDish, quickAddToCart, toggleFavorite });
  latest.current = { setSelectedDish, quickAddToCart, toggleFavorite };
  const openDish = useCallback((dish: MenuItem) => latest.current.setSelectedDish(dish), []);
  const quickAdd = useCallback((dish: MenuItem) => latest.current.quickAddToCart(dish), []);
  const toggleFav = useCallback((id: string) => latest.current.toggleFavorite(id), []);

  const inCartById = useMemo(() => {
    const counts = new Map<string, number>();
    for (const line of cart) counts.set(line.menuItemId, (counts.get(line.menuItemId) ?? 0) + line.quantity);
    return counts;
  }, [cart]);
  const favorites = useMemo(() => new Set(favoriteDishIds), [favoriteDishIds]);

  // Active Category Name
  const activeCategory = MENU_CATEGORIES.find((c) => c.id === liveFilters.category);
  const title = activeCategory ? activeCategory.name : 'Complete Menu';

  // Filtered Items logic
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }
      // Dietary quick toggle (all, veg, non-veg)
      if (filters.dietaryFilter === 'veg' && !item.isVegetarian) return false;
      if (filters.dietaryFilter === 'non-veg' && item.isVegetarian) return false;

      // Dietary preferences
      if (filters.dietaryPreferences.length > 0) {
        const matches = filters.dietaryPreferences.every((pref) =>
          item.dietaryTags.includes(pref)
        );
        if (!matches) return false;
      }

      // Spice level
      if (filters.spiceLevel !== 'all' && item.spiceLevel !== filters.spiceLevel) {
        return false;
      }

      // Price range
      if (filters.priceRange === 'under-200' && item.price >= 200) return false;
      if (
        filters.priceRange === '200-400' &&
        (item.price < 200 || item.price > 400)
      )
        return false;
      if (
        filters.priceRange === '400-600' &&
        (item.price < 400 || item.price > 600)
      )
        return false;
      if (filters.priceRange === '600-plus' && item.price < 600) return false;

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'price-low') return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      return (b.ordersCount || 0) - (a.ordersCount || 0);
    });
  }, [filters, MENU_ITEMS]);

  const vegCount = useMemo(() => MENU_ITEMS.filter((i) => i.isVegetarian).length, [MENU_ITEMS]);
  const nonVegCount = MENU_ITEMS.length - vegCount;

  // Render the list in batches: a 200-dish menu no longer builds every card before the first frame.
  const [visible, setVisible] = useState(BATCH);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => setVisible(BATCH), [filteredItems]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || visible >= filteredItems.length) return;
    const io = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && setVisible((v) => v + BATCH),
      { rootMargin: '800px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, filteredItems.length]);
  const shownItems = filteredItems.slice(0, visible);

  return (
    <div className="min-h-screen bg-white text-slate-850 pb-28">
      {/* Sticky Header */}
      <CustomerHeader title={title} showBack={true} />

      {/* Search Input Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Butter Chicken, Biryani, Naan..."
            value={liveFilters.searchQuery}
            aria-label="Search the menu"
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Horizontal Category Switcher Chips */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
        <button
          onClick={() => setFilters((p) => ({ ...p, category: 'all' }))}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            liveFilters.category === 'all'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Categories
        </button>
        {MENU_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilters((p) => ({ ...p, category: cat.id }))}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              liveFilters.category === cat.id
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.name} ({cat.itemCount})
          </button>
        ))}
      </div>

      {/* Quick Veg/Non-Veg Filter Row (Matching Reference 1 Screen 2) */}
      <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-slate-200/60 sticky top-14 z-30">
        <div className="flex items-center gap-2">
          {/* All */}
          <button
            onClick={() => setFilters((p) => ({ ...p, dietaryFilter: 'all' }))}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              liveFilters.dietaryFilter === 'all'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-600 border border-transparent'
            }`}
          >
            All ({MENU_ITEMS.length})
          </button>

          {/* Veg */}
          <button
            onClick={() => setFilters((p) => ({ ...p, dietaryFilter: 'veg' }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
              liveFilters.dietaryFilter === 'veg'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 border border-transparent'
            }`}
          >
            <Leaf className="w-3 h-3 text-emerald-600" />
            <span>Veg ({vegCount})</span>
          </button>

          {/* Non-Veg */}
          <button
            onClick={() => setFilters((p) => ({ ...p, dietaryFilter: 'non-veg' }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
              liveFilters.dietaryFilter === 'non-veg'
                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                : 'bg-slate-100 text-slate-600 border border-transparent'
            }`}
          >
            <Beef className="w-3 h-3 text-rose-600" />
            <span>Non-Veg ({nonVegCount})</span>
          </button>
        </div>

        {/* Filter Drawer Trigger */}
        <button
          onClick={() => setIsFilterSheetOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors border border-slate-200"
        >
          <SlidersHorizontal className="w-3 h-3 text-amber-600" />
          <span>Filters</span>
        </button>
      </div>

      {/* Dish List Items (Matching Reference 1 Screen 2) */}
      <main className="max-w-md mx-auto px-4 py-3 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No dishes found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your dietary or price filters to see more delicious options.
            </p>
            <button
              onClick={() =>
                setFilters({
                  category: 'all',
                  dietaryFilter: 'all',
                  dietaryPreferences: [],
                  spiceLevel: 'all',
                  priceRange: 'all',
                  sortBy: 'popular',
                  searchQuery: '',
                })
              }
              className="text-xs font-bold text-amber-600 hover:underline pt-2"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {shownItems.map((dish, i) => (
              <DishCard
                key={dish.id}
                dish={dish}
                inCart={inCartById.get(dish.id) ?? 0}
                isFavorite={favorites.has(dish.id)}
                priority={i < PRIORITY_IMAGES}
                onOpen={openDish}
                onQuickAdd={quickAdd}
                onToggleFavorite={toggleFav}
              />
            ))}
            {visible < filteredItems.length && <div ref={sentinel} aria-hidden="true" className="h-px" />}
          </>
        )}
      </main>
    </div>
  );
};
