import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OFFERS } from '../data/offers';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

export const OffersSection: React.FC = () => (
  <section id="offers" className="scroll-mt-20 bg-slate-50 py-24 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading eyebrow="Offers" title={<>Good things, <span className="italic text-amber-500">on the house</span></>} body="Start serving smarter without a big first step." />
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {OFFERS.map((o, i) => (
          <Reveal key={o.title} delay={i * 0.1}>
            <article className={cn('flex h-full flex-col rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated', o.highlight ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-200 bg-white')}>
              <span className={cn('w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider', o.highlight ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700')}>{o.tag}</span>
              <h3 className={cn('mt-5 font-display text-3xl font-semibold', o.highlight ? 'text-white' : 'text-slate-900')}>{o.title}</h3>
              <p className={cn('mt-3 text-sm leading-relaxed', o.highlight ? 'text-amber-50' : 'text-slate-600')}>{o.body}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {o.points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full', o.highlight ? 'bg-white text-amber-600' : 'bg-amber-50 text-amber-600')}>
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className={o.highlight ? 'text-white' : 'text-slate-700'}>{p}</span>
                  </li>
                ))}
              </ul>
              <a href={o.href} className={cn('group mt-8 inline-flex items-center gap-2 pt-2 text-sm font-semibold', o.highlight ? 'text-white' : 'text-amber-600')}>
                {o.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
