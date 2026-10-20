import React from 'react';
import { STEPS } from '../data/content';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/** The guest journey in four steps. */
export const Journey: React.FC = () => (
  <section id="how" className="scroll-mt-20 border-y border-slate-200 bg-white py-24 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeading eyebrow="How it works" title={<>From <span className="italic text-amber-500">hungry</span> to happy in four steps</>} body="No downloads, no waiting for a server to wave you over." />
      </Reveal>

      <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
        <div aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent md:block" />
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title}>
            <Reveal delay={i * 0.1} className="group relative text-center">
              <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-white text-amber-600 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-amber-500 group-hover:text-white">
                <Icon className="h-7 w-7" aria-hidden="true" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{i + 1}</span>
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold text-slate-900">{title}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-slate-600">{body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
