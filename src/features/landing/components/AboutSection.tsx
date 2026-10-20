import React from 'react';
import { MapPin } from 'lucide-react';
import type { LandingData } from '../types';
import { VALUES } from '../data/content';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

export const AboutSection: React.FC<{ stats: LandingData['stats'] }> = ({ stats }) => {
  // Real totals are shown only once there is something to show.
  const numbers = [
    stats.restaurants > 0 && { value: stats.restaurants, label: 'Restaurants live' },
    stats.guests > 0 && { value: stats.guests, label: 'Guests signed up' },
    stats.orders > 0 && { value: stats.orders, label: 'Orders served' },
  ].filter(Boolean) as { value: number; label: string }[];

  return (
    <section id="about" className="scroll-mt-20 bg-white py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <SectionHeading align="left" eyebrow="About RestoFlow" title={<>We make the wait between hungry and fed <span className="italic text-amber-500">feel good</span></>} />
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-600">
            <p>RestoFlow started with a simple frustration: great restaurants losing tables to slow service, missed orders and paper menus nobody could update.</p>
            <p>So we built one flow for the whole room. Guests scan and order from their phone. Kitchens get a clear live screen. Owners see who their guests are and what they love.</p>
          </div>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            <MapPin className="h-4 w-4" aria-hidden="true" /> Proudly built in Mumbai, India
          </p>
          {numbers.length > 0 && (
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-slate-200 pt-8">
              {numbers.map((n) => (
                <div key={n.label}>
                  <dt className="font-display text-4xl font-semibold text-slate-900">{n.value.toLocaleString('en-IN')}</dt>
                  <dd className="mt-1 text-xs text-slate-500">{n.label}</dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>

        <ul className="grid gap-5 self-center">
          {VALUES.map(({ icon: Icon, title, body }, i) => (
            <li key={title}>
              <Reveal delay={i * 0.1}>
                <div className="flex gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 transition-colors hover:border-amber-200 hover:bg-amber-50/50">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-subtle">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-slate-900">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
