'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Flame, UtensilsCrossed } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { LandingDish } from '../types';
import { SAMPLE_DISHES } from '../data/content';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const VegMark: React.FC<{ veg: boolean }> = ({ veg }) => (
  <span className={cn('inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 bg-white', veg ? 'border-emerald-600' : 'border-rose-600')}>
    <span className={cn('h-2 w-2 rounded-full', veg ? 'bg-emerald-600' : 'bg-rose-600')} />
    <span className="sr-only">{veg ? 'Vegetarian' : 'Non-vegetarian'}</span>
  </span>
);

/** "SPRING DOSA" becomes "Spring Dosa"; names that already use mixed case are left alone. */
const niceName = (name: string) =>
  name === name.toUpperCase() ? name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : name;

const TILE_TINTS = ['bg-amber-50 text-amber-600', 'bg-slate-100 text-slate-500', 'bg-rose-50 text-rose-500', 'bg-orange-50 text-orange-500'];

interface Card {
  key: string;
  name: string;
  image?: string;
  price: number;
  veg: boolean;
  by: string;
  note: string;
  href?: string;
}

/** The dishes guests order most (real data), or clearly labelled examples until orders start coming in. */
export const DishesSection: React.FC<{ dishes: LandingDish[] }> = ({ dishes }) => {
  const scroller = useRef<HTMLUListElement>(null);
  const real = dishes.length >= 3;

  const cards: Card[] = real
    ? dishes.map((d) => ({
        key: d.id,
        name: niceName(d.name),
        image: d.image,
        price: d.price,
        veg: d.isVegetarian,
        by: d.restaurantName,
        note: d.timesOrdered > 0 ? `Ordered ${d.timesOrdered} time${d.timesOrdered > 1 ? 's' : ''} this month` : 'On the menu now',
        href: `/r/${d.restaurantSlug}`,
      }))
    : SAMPLE_DISHES.map((d) => ({ key: d.name, name: d.name, image: d.image, price: d.price, veg: d.veg, by: 'Example dish', note: 'Real favourites appear as guests order' }));

  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <section id="dishes" className="scroll-mt-20 bg-slate-50 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionHeading align="left" eyebrow="Best food in restaurants" title={<>What everyone is <span className="italic text-amber-500">ordering</span></>} body={real ? 'The most ordered dishes across RestoFlow restaurants this month.' : 'A taste of what guests find on a RestoFlow menu.'} />
          </Reveal>
          <div className="flex gap-2">
            <button onClick={() => scrollBy(-1)} aria-label="Scroll dishes left" className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-colors hover:border-amber-500 hover:bg-amber-500 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Scroll dishes right" className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-colors hover:border-amber-500 hover:bg-amber-500 hover:text-white">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <ul ref={scroller} className="relative mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((c, i) => {
          const body = (
            <>
              <div className="relative aspect-[4/3] overflow-hidden">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className={cn('flex h-full w-full items-center justify-center', TILE_TINTS[i % TILE_TINTS.length])} aria-hidden="true">
                    <UtensilsCrossed className="h-14 w-14 opacity-60 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.25} />
                  </div>
                )}
                {real && i < 3 && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">
                    <Flame className="h-3.5 w-3.5" aria-hidden="true" /> Popular
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold leading-snug text-slate-900">{c.name}</h3>
                  <VegMark veg={c.veg} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{c.by}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-lg font-extrabold text-slate-900">{formatCurrency(c.price)}</span>
                  <span className="text-right text-xs font-medium text-amber-700">{c.note}</span>
                </div>
              </div>
            </>
          );
          const cls = 'group block h-full w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated sm:w-[300px]';
          return (
            <li key={c.key} className="flex">
              {c.href ? (
                <Link href={c.href} className={cls}>{body}</Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
