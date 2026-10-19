'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Flame,
  Salad,
  Drumstick,
  Utensils,
  Dices,
  Cake,
  Check,
  Star,
  Users,
  Percent,
  Plus,
  Heart,
  RotateCcw,
  Soup,
  Beef,
  Leaf,
  CookingPot,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

const OPTION_ICONS: Record<string, LucideIcon> = {
  Drumstick,
  Salad,
  Flame,
  Soup,
  Beef,
  Cake,
  Leaf,
  CookingPot,
  UtensilsCrossed,
  Utensils,
};
import { useCustomer } from '../context/CustomerContext';
import { DietaryPreference, MenuItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { CustomerHeader } from './CustomerHeader';

export const HelpMeChooseWizard: React.FC = () => {
  const { setActiveScreen, quickAddToCart, setSelectedDish, favoriteDishIds, toggleFavorite,
    menuItems: MENU_ITEMS } =
    useCustomer();

  const [step, setStep] = useState<number>(1);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(['Spicy', 'Something Filling']);
  const [hungerLevel, setHungerLevel] = useState<string>('Normal');
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>(['non-vegetarian']);
  const [budgetTier, setBudgetTier] = useState<string>('₹300 - ₹500');
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [freeformPrompt, setFreeformPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'top-picks'>('top-picks');

  // Step 1 Mood options
  const moodOptions = [
    { id: 'Something Filling', label: 'Something Filling', icon: 'Drumstick' },
    { id: 'Something Light', label: 'Something Light', icon: 'Salad' },
    { id: 'Spicy', label: 'Spicy', icon: 'Flame' },
    { id: 'Comfort Food', label: 'Comfort Food', icon: 'Soup' },
    { id: 'Protein Rich', label: 'Protein Rich', icon: 'Beef' },
    { id: 'Something Sweet', label: 'Something Sweet', icon: 'Cake' },
  ];

  const hungerOptions = [
    { id: 'Light', label: 'Light', icon: 'Leaf' },
    { id: 'Normal', label: 'Normal', icon: 'Utensils' },
    { id: 'Very Hungry', label: 'Very Hungry', icon: 'CookingPot' },
    { id: 'Extremely Hungry', label: 'Extremely Hungry', icon: 'UtensilsCrossed' },
  ];

  const dietaryOptions: { id: DietaryPreference; label: string }[] = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'non-vegetarian', label: 'Non-Vegetarian' },
    { id: 'egg', label: 'Egg' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'dairy-free', label: 'Dairy-Free' },
    { id: 'halal', label: 'Halal' },
  ];

  const budgetOptions = ['Under ₹300', '₹300 - ₹500', '₹500 - ₹800', '₹800 - ₹1,200', '₹1,200+'];

  const toggleMood = (id: string) => {
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleDiet = (id: DietaryPreference) => {
    setDietaryPrefs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  // Top recommendations generated dynamically
  const recommendations: { dish: MenuItem; reasons: string[] }[] = [...MENU_ITEMS]
    .filter((d) => d.isAvailable)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 3)
    .map((dish) => ({
      dish,
      reasons: [
        `Rated ${dish.rating} by ${dish.reviewCount.toLocaleString('en-IN')} guests`,
        dish.isChefSpecial ? 'Chef recommendation' : `Ready in about ${dish.prepTimeMinutes} minutes`,
        dish.spiceLevel === 'mild' ? 'Gentle on the palate' : `Matches a ${dish.spiceLevel.replace('-', ' ')} spice preference`,
      ],
    }));

  return (
    <div className="min-h-screen bg-white text-slate-850 pb-28">
      {/* Header */}
      <CustomerHeader
        title={step <= 4 ? 'Help Me Choose' : 'AI Recommendations'}
        showBack={true}
        onBack={() => {
          if (step > 1 && step <= 4) setStep(step - 1);
          else if (step > 4) setStep(4);
          else setActiveScreen('home');
        }}
      />

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Progress Bar (Steps 1 to 4) */}
        {step <= 4 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5 text-amber-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Help Me Choose</span>
              </span>
              <span>Step {step} of 4</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-full rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-amber-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: MOOD (Matching Reference 3 Screen 2) */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                What are you in the mood for?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select one or more options
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {moodOptions.map((opt) => {
                const isSelected = selectedMoods.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleMood(opt.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 text-center ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {React.createElement(OPTION_ICONS[opt.icon], { className: 'mb-1.5 h-6 w-6 text-amber-600' })}
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Surprise Me Option */}
            <button
              onClick={() => {
                setSelectedMoods(['Spicy', 'Comfort Food']);
                setStep(2);
              }}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl text-left hover:border-amber-400 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <Dices className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Surprise Me</p>
                  <p className="text-[11px] text-slate-500">I&apos;m open to anything delicious!</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </button>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: HUNGER & DIETARY (Matching Reference 3 Screen 3) */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                How hungry are you?
              </h2>
              <p className="text-xs text-slate-500 mt-1">Pick your appetite</p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {hungerOptions.map((opt) => {
                const isSelected = hungerLevel === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setHungerLevel(opt.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {React.createElement(OPTION_ICONS[opt.icon], { className: 'mb-1 h-6 w-6 text-amber-600' })}
                    <span className="text-[11px] font-bold text-center leading-tight">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Any dietary preferences?
              </h3>
              <p className="text-xs text-slate-500 -mt-2">Select all that apply</p>

              <div className="grid grid-cols-2 gap-2">
                {dietaryOptions.map((opt) => {
                  const isSelected = dietaryPrefs.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleDiet(opt.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3 & 4: BUDGET & PEOPLE (Matching Reference 3 Screen 4) */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                What&apos;s your budget?
              </h2>
              <p className="text-xs text-slate-500 mt-1">Per person estimation (Optional)</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {budgetOptions.map((b) => {
                const isSelected = budgetTier === b;
                return (
                  <button
                    key={b}
                    onClick={() => setBudgetTier(b)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Number of people?</h3>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((count) => {
                  const isSelected = peopleCount === count;
                  return (
                    <button
                      key={count}
                      onClick={() => setPeopleCount(count)}
                      className={`py-2.5 rounded-xl border text-sm font-extrabold transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {count === 4 ? '4+' : count}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">
                Any specific preference?
              </h3>
              <input
                type="text"
                placeholder="e.g. I like creamy food, biryani, not too spicy..."
                value={freeformPrompt}
                onChange={(e) => setFreeformPrompt(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors shadow-xs"
              />
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>Show Recommendations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 5: AI RECOMMENDATIONS RESULT (Matching Reference 3 Screens 5 & 7) */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Context Badge Pill */}
            <div className="p-3 bg-purple-50/80 border border-purple-200/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Recommendation Engine</span>
              </div>
              <p className="text-[11px] text-purple-900 leading-relaxed">
                Based on: <span className="font-semibold">{selectedMoods.join(', ')}</span> •{' '}
                <span className="font-semibold">{hungerLevel} appetite</span> •{' '}
                <span className="font-semibold">{dietaryPrefs.join(', ')}</span> • For{' '}
                <span className="font-semibold">{peopleCount} people</span> (Budget {budgetTier})
              </p>
            </div>

            {/* Sub-tabs: Top Picks, Complete Meals, Popular Now */}
            <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('top-picks')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'top-picks'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Top Picks
              </button>
              
              <button
                onClick={() => setActiveScreen('popular')}
                className="flex-1 py-1.5 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900"
              >
                Popular Now
              </button>
            </div>

            {/* TAB 1: TOP PICKS (Ranked Cards #1, #2, #3 matching Reference 3 Screen 5) */}
            {activeTab === 'top-picks' && (
              <div className="space-y-4">
                {recommendations.map((rec, index) => {
                  const dish = rec.dish;
                  const isFav = favoriteDishIds.includes(dish.id);

                  return (
                    <div
                      key={dish.id}
                      className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-card hover:border-amber-300 transition-all"
                    >
                      {/* Image Banner with Rank # Badge */}
                      <div className="relative h-40 w-full bg-slate-900">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                        {/* Rank Badge #1, #2, #3 */}
                        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                          #{index + 1}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={() => toggleFavorite(dish.id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFav ? 'fill-red-500 text-red-500' : 'text-white'
                            }`}
                          />
                        </button>

                        <div className="absolute bottom-2.5 inset-x-3 flex items-end justify-between text-white">
                          <div>
                            <h3 className="text-base font-bold leading-tight">
                              {dish.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-amber-300 mt-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-white">{dish.rating}</span>
                              <span className="text-slate-300">
                                ({(dish.reviewCount / 1000).toFixed(1)}K orders)
                              </span>
                            </div>
                          </div>
                          <span className="text-lg font-black text-white">
                            {formatCurrency(dish.price)}
                          </span>
                        </div>
                      </div>

                      {/* Content & Why We Recommend This */}
                      <div className="p-3.5 space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-md">
                            <Flame className="mr-0.5 inline h-3 w-3" /> {dish.spiceLevel}
                          </span>
                          {dish.isChefSpecial && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                              Chef&apos;s Special
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">
                            Most Ordered
                          </span>
                        </div>

                        {/* Reasoning checklist */}
                        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 space-y-1.5">
                          <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                            Why we recommend this:
                          </p>
                          {rec.reasons.map((r, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                              <Check className="w-3 h-3 text-amber-600 stroke-[3] mt-0.5 shrink-0" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>

                        {/* Add to Cart CTA */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setSelectedDish(dish)}
                            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
                          >
                            Customize / Details
                          </button>
                          <button
                            onClick={() => quickAddToCart(dish)}
                            className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1"
                          >
                            <span>Add to Cart</span>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            
          </div>
        )}
      </main>
    </div>
  );
};
