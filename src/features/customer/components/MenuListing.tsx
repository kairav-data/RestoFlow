'use client';

import React, { useMemo } from 'react';
import {
  Star,
  Plus,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  Search,
  Leaf,
  Beef,
  Flame,
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { DishPrice } from '@/features/menu/components/DishPrice';
import { formatCurrency } from '@/lib/utils';
import { CustomerHeader } from './CustomerHeader';
import { MenuItem } from '@/types';

export const MenuListing: React.FC = () => {
  const { menuItems: MENU_ITEMS, categories: MENU_CATEGORIES } = useCustomer();
  const {
    filters,
    setFilters,
    setIsFilterSheetOpen,
    addToCart, quickAddToCart,
    setSelectedDish,
    favoriteDishIds,
    toggleFavorite,
    cart,
  } = useCustomer();

  // Active Category Name
  const activeCategory = MENU_CATEGORIES.find((c) => c.id === filters.category);
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
  }, [filters]);

  const vegCount = MENU_ITEMS.filter((i) => i.isVegetarian).length;
  const nonVegCount = MENU_ITEMS.filter((i) => !i.isVegetarian).length;

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
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Horizontal Category Switcher Chips */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
        <button
          onClick={() => setFilters((p) => ({ ...p, category: 'all' }))}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filters.category === 'all'
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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filters.category === cat.id
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.name} ({cat.itemCount})
          </button>
        ))}
      </div>

      {/* Quick Veg/Non-Veg Filter Row (Matching Reference 1 Screen 2) */}
      <div className="bg-white/80 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between border-b border-slate-200/60 sticky top-14 z-30">
        <div className="flex items-center gap-2">
          {/* All */}
          <button
            onClick={() => setFilters((p) => ({ ...p, dietaryFilter: 'all' }))}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              filters.dietaryFilter === 'all'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-600 border border-transparent'
            }`}
          >
            All ({MENU_ITEMS.length})
          </button>

          {/* Veg */}
          <button
            onClick={() => setFilters((p) => ({ ...p, dietaryFilter: 'veg' }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              filters.dietaryFilter === 'veg'
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
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              filters.dietaryFilter === 'non-veg'
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
          filteredItems.map((dish) => {
            const inCart = cart.find((i) => i.menuItemId === dish.id);

            return (
              <div
                key={dish.id}
                onClick={() => setSelectedDish(dish)}
                className="flex items-start gap-3.5 p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-subtle hover:shadow-card hover:border-amber-300/80 transition-all cursor-pointer group"
              >
                {/* Left Food Image */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Veg / Non-Veg Indicator Dot */}
                  <div className="absolute top-1.5 left-1.5 p-0.5 bg-white/90 backdrop-blur-sm rounded-sm shadow-xs">
                    <div
                      className={`w-3 h-3 border rounded-xs flex items-center justify-center ${
                        dish.isVegetarian
                          ? 'border-emerald-600'
                          : 'border-rose-600'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          dish.isVegetarian ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Favorite Heart */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(dish.id);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <Heart
                      className={`w-3 h-3 ${
                        favoriteDishIds.includes(dish.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Right Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                        {dish.name}
                      </h4>
                      <DishPrice dish={dish} className="font-extrabold text-slate-900 text-sm text-right ml-1" />
                    </div>

                    {/* Rating & Orders */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{dish.rating}</span>
                      </div>
                      <span>•</span>
                      <span>({(dish.reviewCount / 1000).toFixed(1)}K orders)</span>
                    </div>

                    {/* Short Description */}
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  {/* Bottom Tags & Add Button */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Spice Tag */}
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-semibold rounded-md border border-rose-100">
                        <Flame className="w-2.5 h-2.5" />
                        <span className="capitalize">{dish.spiceLevel}</span>
                      </span>

                      {/* Chef Special Tag */}
                      {dish.isChefSpecial && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-md border border-emerald-100">
                          Chef&apos;s Special
                        </span>
                      )}
                    </div>

                    {/* Circular Amber + Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        quickAddToCart(dish);
                      }}
                      className="relative w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-sm active:scale-90 transition-all shrink-0"
                      aria-label={`Add ${dish.name}`}
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      {inCart && (
                        <span className="absolute -top-1 -right-1 bg-slate-900 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                          {inCart.quantity}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};
