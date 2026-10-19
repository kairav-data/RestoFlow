'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { fetchRestaurant } from '@/features/restaurants/services/restaurantService';

export const PortalFinder: React.FC = () => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    try {
      const restaurant = await fetchRestaurant(code);
      if (!restaurant) {
        setError('We could not find that restaurant code. Check it and try again.');
        return;
      }
      router.push(`/portal/${restaurant.slug}`);
    } catch {
      setError('We could not check that code right now. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <label htmlFor="restaurant-code" className="block text-sm font-medium text-slate-700">
          Restaurant code
        </label>
        <input
          id="restaurant-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError('');
          }}
          placeholder="e.g. your-restaurant"
          autoComplete="off"
          autoCapitalize="none"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'restaurant-code-error' : undefined}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
        />
        {error && (
          <p id="restaurant-code-error" role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!code.trim() || checking}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
