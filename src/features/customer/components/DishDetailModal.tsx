'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  Flame,
  Zap,
  Info,
  Check,
  Plus,
  Minus,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { formatCurrency } from '@/lib/utils';
import { MenuItemPairing } from '@/types';
import { NutritionPanel } from '@/features/menu/components/NutritionPanel';

export const DishDetailModal: React.FC = () => {
  const {
    selectedDish,
    setSelectedDish,
    addToCart,
    favoriteDishIds,
    toggleFavorite,
    restaurant,
  } = useCustomer();

  const [quantity, setQuantity] = useState<number>(1);
  const [portion, setPortion] = useState<'half' | 'full'>('full');
  const [selectedPairings, setSelectedPairings] = useState<MenuItemPairing[]>([]);

  useEffect(() => {
    setPortion('full');
    setQuantity(1);
  }, [selectedDish?.id]);

  if (!selectedDish) return null;

  const isFavorite = favoriteDishIds.includes(selectedDish.id);

  const togglePairing = (pairing: MenuItemPairing) => {
    setSelectedPairings((prev) => {
      const exists = prev.some((p) => p.id === pairing.id);
      if (exists) return prev.filter((p) => p.id !== pairing.id);
      return [...prev, pairing];
    });
  };

  const pairingsTotal = selectedPairings.reduce((sum, p) => sum + p.price, 0);
  const unitPrice = portion === 'half' && selectedDish.halfPrice !== undefined ? selectedDish.halfPrice : selectedDish.price;
  const totalPrice = (unitPrice + pairingsTotal) * quantity;

  const handleAddToCart = () => {
    addToCart(selectedDish, quantity, selectedPairings, portion);
    setSelectedDish(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pb-24">
          {/* Hero Image Section with Action Overlay */}
          <div className="relative h-64 w-full bg-slate-900">
            <img
              src={selectedDish.image}
              alt={selectedDish.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            {/* Top Bar Actions */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
              <button
                onClick={() => setSelectedDish(null)}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(selectedDish.id)}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  aria-label="Favorite"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedDish.name,
                        text: `Check out ${selectedDish.name} at ${restaurant.name}!`,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Details Content Container */}
          <div className="p-5 space-y-5 bg-white">
            {/* Header: Title, Price, Rating */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {selectedDish.name}
                </h2>
                <span className="text-xl font-extrabold text-slate-900 whitespace-nowrap">
                  {formatCurrency(unitPrice)}
                </span>
              </div>

              {selectedDish.halfPrice !== undefined && (
                <div role="radiogroup" aria-label="Plate size" className="grid grid-cols-2 gap-2 pt-1">
                  {(['half', 'full'] as const).map((size) => {
                    const active = portion === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setPortion(size)}
                        className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          active ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="block text-xs font-semibold capitalize text-slate-900">{size} plate</span>
                        <span className="block text-sm font-extrabold text-slate-900">
                          {formatCurrency(size === 'half' ? selectedDish.halfPrice ?? 0 : selectedDish.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{selectedDish.rating}</span>
                </div>
                <span>•</span>
                <span>({selectedDish.reviewCount.toLocaleString()} orders)</span>
              </div>

              {/* Badges row: Most Ordered, Chef's Special, Best Seller */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {selectedDish.isMostOrdered && (
                  <span className="px-2.5 py-1 bg-rose-50 text-rose-600 font-bold text-xs rounded-full border border-rose-200 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    <span>Most Ordered</span>
                  </span>
                )}
                {selectedDish.isChefSpecial && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
                    <UtensilsCrossed className="w-3 h-3" />
                    <span>Chef&apos;s Special</span>
                  </span>
                )}
                {selectedDish.isBestSeller && (
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full border border-blue-200 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>Best Seller</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedDish.description}
            </p>

            {/* Why Customers Love It (Checklist) */}
            {selectedDish.whyCustomersLoveIt.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Why Customers Love It
                </h3>
                <div className="space-y-2 bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5">
                  {selectedDish.whyCustomersLoveIt.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs text-slate-700 font-medium">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/60 py-3">
              <div className="flex flex-col items-center gap-1 px-2 text-center">
                <Flame className="h-5 w-5 text-rose-500" />
                <span className="text-xs font-semibold capitalize text-slate-800">{selectedDish.spiceLevel.replace('-', ' ')}</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-2 text-center">
                <Zap className="h-5 w-5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-800">
                  {selectedDish.calories > 0 ? `${selectedDish.calories} kcal` : selectedDish.isVegetarian ? 'Pure Veg' : 'Non-Veg'}
                </span>
                {selectedDish.calories > 0 && <span className="text-[10px] text-slate-400">per serving</span>}
              </div>
              <div className="flex flex-col items-center gap-1 px-2 text-center">
                <Info className="h-5 w-5 text-slate-500" />
                <span className="line-clamp-2 text-xs font-semibold text-slate-800">
                  {selectedDish.allergens.length > 0 ? `Contains ${selectedDish.allergens.slice(0, 2).join(', ')}` : 'No listed allergens'}
                </span>
              </div>
            </div>

            <NutritionPanel nutrition={selectedDish.nutrition} />

            {/* You Might Also Like / Perfect Pairings (Interactive Add-ons) */}
            {selectedDish.pairings.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Perfect Pairings
                  </h3>
                  <span className="text-[11px] text-amber-600 font-medium">
                    Tap to add
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {selectedDish.pairings.map((pairing) => {
                    const isSelected = selectedPairings.some(
                      (p) => p.id === pairing.id
                    );

                    return (
                      <div
                        key={pairing.id}
                        onClick={() => togglePairing(pairing)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-50 border-amber-400 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-full h-16 rounded-lg overflow-hidden mb-1.5 relative bg-slate-100">
                          <img
                            src={pairing.image}
                            alt={pairing.name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">
                            {pairing.name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-extrabold text-slate-900">
                              {formatCurrency(pairing.price)}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : <Plus className="h-3 w-3" strokeWidth={3} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Floating Footer Bar (Matching Reference 1 Screen 3) */}
        <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-white border-t border-slate-200 p-4 shadow-elevated z-30 flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2 py-1.5 shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1 text-slate-600 hover:text-slate-900 active:scale-95 transition-transform"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center font-extrabold text-sm text-slate-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 text-slate-600 hover:text-slate-900 active:scale-95 transition-transform"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Add to Cart</span>
            <span>•</span>
            <span className="font-extrabold">{formatCurrency(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
