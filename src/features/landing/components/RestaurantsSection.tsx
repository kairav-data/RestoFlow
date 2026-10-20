'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Search, Star, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandingRestaurant } from '../types';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const COVER_FALLBACK = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=70';

const RestaurantCard: React.FC<{ r: LandingRestaurant }> = ({ r }) => (
  <Link href={`/r/${r.slug}`} className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-elevated">
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={r.cover ?? COVER_FALLBACK} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      {r.ratingCount > 0 && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-900 shadow-subtle">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden="true" /> {r.rating.toFixed(1)}
          <span className="font-medium text-slate-500">({r.ratingCount})</span>
        </span>
      )}
      {r.logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.logo} alt="" className="absolute bottom-3 left-3 h-12 w-12 rounded-xl border-2 border-white bg-white object-contain shadow-card" />
      )}
    </div>
    <div className="flex items-start justify-between gap-3 p-5">
      <div className="min-w-0">
        <h3 className="truncate font-display text-xl font-semibold text-slate-900">{r.name}</h3>
        <p className="mt-1 truncate text-sm text-slate-500">{[r.cuisine, r.location].filter(Boolean).join(' · ') || 'Dine in with RestoFlow'}</p>
        {r.dishCount > 0 && <p className="mt-3 text-xs font-medium text-amber-700">{r.dishCount} dishes on the menu</p>}
      </div>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-white">
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </div>
  </Link>
);

/** Live list of restaurants taking orders on RestoFlow, filterable by area or cuisine. */
export const RestaurantsSection: React.FC<{ restaurants: LandingRestaurant[] }> = ({ restaurants }) => {
  const [query, setQuery] = useState('');
  const [place, setPlace] = useState('All');

  const places = useMemo(() => ['All', ...Array.from(new Set(restaurants.map((r) => r.location).filter(Boolean)))], [restaurants]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants.filter((r) => (place === 'All' || r.location === place) && (!q || `${r.name} ${r.cuisine} ${r.location}`.toLowerCase().includes(q)));
  }, [restaurants, query, place]);

  return (
    <section id="restaurants" className="scroll-mt-20 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Best restaurants near you" title={<>Find your next <span className="italic text-amber-500">table</span></>} body="Restaurants that take orders on RestoFlow. Scan the QR on your table, or open a menu from here to look around." />
        </Reveal>

        {restaurants.length > 0 && (
          <Reveal className="mx-auto mt-10 max-w-3xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by restaurant, cuisine or area"
                aria-label="Search restaurants"
                className="w-full rounded-full border border-slate-200 bg-white py-4 pl-14 pr-6 text-base shadow-card transition-colors focus:border-amber-400 focus:outline-none"
              />
            </div>
            {places.length > 2 && (
              <div role="group" aria-label="Filter by area" className="mt-4 flex flex-wrap justify-center gap-2">
                {places.map((p) => (
                  <button key={p} aria-pressed={place === p} onClick={() => setPlace(p)} className={cn('inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors', place === p ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-200 text-slate-600 hover:border-amber-300')}>
                    {p !== 'All' && <MapPin className="h-3.5 w-3.5" aria-hidden="true" />} {p}
                  </button>
                ))}
              </div>
            )}
          </Reveal>
        )}

        {restaurants.length === 0 ? (
          <Reveal className="mx-auto mt-14 max-w-xl">
            <div className="rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-card">
                <Store className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-slate-900">Your restaurant could be the first</h3>
              <p className="mt-2 text-slate-600">We are onboarding restaurants in Mumbai right now. Get listed and start taking orders from the table.</p>
              <a href="#contact" className="mt-6 inline-flex rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600">List your restaurant</a>
            </div>
          </Reveal>
        ) : shown.length === 0 ? (
          <p className="mt-14 text-center text-slate-500">No restaurants match that search. Try another area or cuisine.</p>
        ) : (
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((r, i) => (
              <li key={r.slug} className="min-w-0">
                <Reveal delay={Math.min(i, 5) * 0.06}>
                  <RestaurantCard r={r} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
