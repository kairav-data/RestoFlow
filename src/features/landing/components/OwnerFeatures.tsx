import React from 'react';
import { cn } from '@/lib/utils';
import { OWNER_FEATURES } from '../data/content';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/** What a restaurant gets: a bento grid, with the AI menu scan as the dark hero tile. */
export const OwnerFeatures: React.FC = () => (
  <section id="features" className="scroll-mt-20 bg-white py-24 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading eyebrow="For restaurants" title={<>Run the floor from <span className="italic text-amber-500">one screen</span></>} body="Everything a busy owner needs, and nothing that gets in the way of service." />
      </Reveal>

      <div className="mt-16 grid auto-rows-fr gap-5 md:grid-cols-3">
        {OWNER_FEATURES.map(({ icon: Icon, title, body, wide }, i) => {
          const dark = i === 0;
          return (
            <Reveal key={title} delay={(i % 3) * 0.08} className={cn(wide && 'md:col-span-2')}>
              <article className={cn('group relative h-full overflow-hidden rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated', dark ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50')}>
                {dark && <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/25 blur-3xl" />}
                <span className={cn('relative flex h-12 w-12 items-center justify-center rounded-2xl', dark ? 'bg-amber-500 text-white' : 'bg-white text-amber-600 shadow-subtle')}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className={cn('relative mt-6 font-display text-2xl font-semibold', dark ? 'text-white' : 'text-slate-900')}>{title}</h3>
                <p className={cn('relative mt-3 max-w-md text-sm leading-relaxed', dark ? 'text-slate-300' : 'text-slate-600')}>{body}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
