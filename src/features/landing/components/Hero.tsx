'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BellRing, ChefHat, MapPin, ScanLine, Star } from 'lucide-react';
import type { LandingData } from '../types';
import { PhoneFrame } from './PhoneFrame';
import { PhoneScreen } from './PhoneScreens';

const FACTS = [
  { value: 'No app', label: 'Opens in any phone browser' },
  { value: '~5 sec', label: 'From guest tap to kitchen screen' },
  { value: 'Half & full', label: 'Plates, with nutrition facts' },
] as const;

const float = (delay: number, distance = 10) => ({
  animate: { y: [0, -distance, 0] },
  transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay },
});

export const Hero: React.FC<{ stats: LandingData['stats'] }> = ({ stats }) => {
  const reduce = useReducedMotion();
  const live = stats.restaurants > 0;

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      {/* One soft red wash and a dotted grid: depth without noise. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full bg-amber-100/70 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{ backgroundImage: 'radial-gradient(#E9E5E5 1px, transparent 1px)', backgroundSize: '24px 24px', maskImage: 'linear-gradient(to bottom, black 30%, transparent 90%)' }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 pb-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-32">
        <div>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-amber-700 shadow-subtle"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            {live ? `${stats.restaurants} restaurant${stats.restaurants > 1 ? 's' : ''} live on RestoFlow` : 'Now onboarding restaurants in Mumbai'}
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-6xl font-semibold leading-[0.98] tracking-tight text-slate-900 sm:text-7xl lg:text-[5.5rem]"
          >
            Every table.
            <br />
            <span className="italic text-amber-500">One flow.</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl"
          >
            Guests scan, browse a beautiful menu and order from their own phone. Kitchens see it in seconds. Everyone gets back to the food.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a href="#restaurants" className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-4 text-base font-semibold text-white shadow-card transition-all hover:bg-amber-600 hover:shadow-elevated">
              Find a restaurant
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-800 transition-colors hover:border-amber-400 hover:text-amber-600">
              List your restaurant
            </a>
            <Link href="/scan" className="inline-flex items-center gap-2 px-3 py-4 text-sm font-semibold text-slate-600 hover:text-amber-600">
              <ScanLine className="h-4 w-4" aria-hidden="true" /> Scan a table QR
            </Link>
          </motion.div>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-slate-200 pt-8">
            {FACTS.map((f) => (
              <div key={f.value}>
                <dt className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">{f.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-slate-500">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[420px]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <PhoneFrame>
              <PhoneScreen screen="menu" />
            </PhoneFrame>
          </motion.div>

          <motion.div {...(reduce ? {} : float(0))} className="absolute -left-6 top-10 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 pr-5 shadow-elevated sm:flex lg:-left-28">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <BellRing className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xs text-slate-500">New order</span>
              <span className="block text-sm font-bold text-slate-900">Table T12 · #24</span>
            </span>
          </motion.div>

          <motion.div {...(reduce ? {} : float(1.2, 12))} className="absolute -right-6 top-[300px] hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 pr-5 shadow-elevated sm:flex lg:-right-24">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ChefHat className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xs text-slate-500">Kitchen</span>
              <span className="block text-sm font-bold text-slate-900">Cooking now</span>
            </span>
          </motion.div>

          <motion.div {...(reduce ? {} : float(0.6, 8))} className="absolute -bottom-4 left-2 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 pr-5 shadow-elevated sm:flex lg:-left-20">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Star className="h-5 w-5 fill-amber-500" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xs text-slate-500">Guest review</span>
              <span className="block text-sm font-bold text-slate-900">Loved the biryani</span>
            </span>
          </motion.div>

          <span className="absolute -right-3 bottom-10 hidden items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-elevated lg:flex">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Mumbai
          </span>
        </div>
      </div>
    </section>
  );
};
