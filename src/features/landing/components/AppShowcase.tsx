'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { APP_SCREENS } from '../data/content';
import { PhoneFrame } from './PhoneFrame';
import { PhoneScreen } from './PhoneScreens';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

const ROTATE_MS = 5000;

/** The guest app on a phone. Four screens rotate on their own; tapping a feature jumps to its screen and pauses the tour. */
export const AppShowcase: React.FC = () => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const count = APP_SCREENS.length;

  useEffect(() => {
    if (!auto || reduce) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [active, auto, reduce, count]);

  const at = (offset: number) => APP_SCREENS[(active + offset + count) % count];

  return (
    <section id="app" className="scroll-mt-20 overflow-hidden bg-amber-50/60 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="The mobile app" title={<>Your whole restaurant, <span className="italic text-amber-500">in a pocket</span></>} body="This is what guests see after they scan. Fast, photographic and made for one thumb." />
        </Reveal>

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div role="tablist" aria-label="App features" className="order-2 space-y-3 lg:order-1">
            {APP_SCREENS.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setActive(i);
                    setAuto(false);
                  }}
                  className={cn(
                    'relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300',
                    on ? 'border-amber-300 bg-white shadow-card' : 'border-transparent hover:bg-white/70',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors', on ? 'bg-amber-500 text-white' : 'bg-white text-slate-500')}>{i + 1}</span>
                    <span className={cn('font-display text-xl font-semibold', on ? 'text-slate-900' : 'text-slate-500')}>{s.label}</span>
                  </span>
                  {on && <p className="mt-3 pl-11 text-sm leading-relaxed text-slate-600">{s.body}</p>}
                  {on && auto && !reduce && (
                    <motion.span key={`${active}-bar`} className="absolute bottom-0 left-0 h-0.5 bg-amber-500" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative order-1 flex items-center justify-center lg:order-2" style={{ minHeight: 640 }}>
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100 blur-3xl" />
            <div aria-hidden="true" className="absolute left-0 hidden origin-right -translate-x-10 scale-[0.8] opacity-60 min-[1700px]:block">
              <PhoneFrame><PhoneScreen screen={at(-1).id} /></PhoneFrame>
            </div>
            <div aria-hidden="true" className="absolute right-0 hidden origin-left translate-x-10 scale-[0.8] opacity-60 min-[1700px]:block">
              <PhoneFrame><PhoneScreen screen={at(1).id} /></PhoneFrame>
            </div>
            <div className="relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={at(0).id}
                  initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ duration: 0.35 }}
                >
                  <PhoneFrame label={`RestoFlow guest app: ${at(0).label}`}>
                    <PhoneScreen screen={at(0).id} />
                  </PhoneFrame>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
