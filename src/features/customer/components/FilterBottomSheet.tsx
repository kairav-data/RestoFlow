'use client';

import React from 'react';
import {
  X,
  Flame,
  Leaf,
  Beef,
  Egg,
  ShieldCheck,
  Milk,
  Wheat,
  Check,
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { DietaryPreference, SpiceLevel } from '@/types';

export const FilterBottomSheet: React.FC = () => {
  const { menuItems: MENU_ITEMS } = useCustomer();
  const { isFilterSheetOpen, setIsFilterSheetOpen, filters, setFilters, resetFilters } =
    useCustomer();

  if (!isFilterSheetOpen) return null;

  const toggleDietaryPref = (pref: DietaryPreference) => {
    setFilters((prev) => {
      const exists = prev.dietaryPreferences.includes(pref);
      return {
        ...prev,
        dietaryPreferences: exists
          ? prev.dietaryPreferences.filter((p) => p !== pref)
          : [...prev.dietaryPreferences, pref],
      };
    });
  };

  const dietaryOptions: { id: DietaryPreference; label: string; icon: React.ReactNode }[] = [
    { id: 'vegetarian', label: 'Vegetarian', icon: <Leaf className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'non-vegetarian', label: 'Non-Vegetarian', icon: <Beef className="w-3.5 h-3.5 text-rose-600" /> },
    { id: 'egg', label: 'Egg', icon: <Egg className="w-3.5 h-3.5 text-amber-600" /> },
    { id: 'vegan', label: 'Vegan', icon: <Leaf className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'gluten-free', label: 'Gluten-Free', icon: <Wheat className="w-3.5 h-3.5 text-orange-500" /> },
    { id: 'dairy-free', label: 'Dairy-Free', icon: <Milk className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'jain', label: 'Jain Food', icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> },
    { id: 'halal', label: 'Halal', icon: <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> },
  ];

  const spiceLevels: { id: SpiceLevel; label: string; count: number }[] = [
    { id: 'mild', label: 'Mild', count: 1 },
    { id: 'medium', label: 'Medium', count: 2 },
    { id: 'spicy', label: 'Spicy', count: 3 },
    { id: 'extra-spicy', label: 'Extra Spicy', count: 4 },
  ];

  const priceRanges: { id: 'under-200' | '200-400' | '400-600' | '600-plus'; label: string }[] = [
    { id: 'under-200', label: 'Under ₹200' },
    { id: '200-400', label: '₹200 - ₹400' },
    { id: '400-600', label: '₹400 - ₹600' },
    { id: '600-plus', label: '₹600+' },
  ];

  const sortOptions: { id: 'popular' | 'rating' | 'price-low' | 'price-high' | 'newest'; label: string }[] = [
    { id: 'popular', label: 'Most Popular' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'newest', label: 'Newest First' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 flex justify-center items-end sm:items-center">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setIsFilterSheetOpen(false)}
            className="p-1 -ml-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-slate-900">Filters</h2>
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
          >
            Clear All
          </button>
        </div>

        {/* Scrollable Filter Options */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1 text-slate-900 pb-28">
          {/* 1. Dietary Preference */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Dietary Preference</h3>
            <div className="grid grid-cols-2 gap-2">
              {dietaryOptions.map((opt) => {
                const isSelected = filters.dietaryPreferences.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleDietaryPref(opt.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="shrink-0">{opt.icon}</span>
                    <span className="flex-1 truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Spice Level */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Spice Level</h3>
            <div className="grid grid-cols-4 gap-2">
              {spiceLevels.map((spice) => {
                const isSelected = filters.spiceLevel === spice.id;
                return (
                  <button
                    key={spice.id}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        spiceLevel: isSelected ? 'all' : spice.id,
                      }))
                    }
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex gap-0.5 mb-1.5">
                      {Array.from({ length: spice.count }).map((_, i) => (
                        <Flame
                          key={i}
                          className="w-3.5 h-3.5 fill-rose-500 text-rose-500"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">
                      {spice.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Price Range */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Price Range</h3>
            <div className="grid grid-cols-4 gap-2">
              {priceRanges.map((range) => {
                const isSelected = filters.priceRange === range.id;
                return (
                  <button
                    key={range.id}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: isSelected ? 'all' : range.id,
                      }))
                    }
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition truncate ${
                      isSelected
                        ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Sort By */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Sort By</h3>
            <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              {sortOptions.map((sort) => {
                const isSelected = filters.sortBy === sort.id;
                return (
                  <label
                    key={sort.id}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, sortBy: sort.id }))
                    }
                    className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                  >
                    <span
                      className={`text-xs ${
                        isSelected
                          ? 'font-bold text-slate-950'
                          : 'font-medium text-slate-700'
                      }`}
                    >
                      {sort.label}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Apply Button (Matching Reference 1 Screen 4) */}
        <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-white border-t border-slate-200 p-4 shadow-elevated z-30">
          <button
            onClick={() => setIsFilterSheetOpen(false)}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.99] transition flex items-center justify-center gap-1.5"
          >
            <span>Apply Filters ({MENU_ITEMS.length} items)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
