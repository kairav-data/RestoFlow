import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  align?: 'left' | 'center';
  className?: string;
}

/** Eyebrow label, large serif title and a supporting line: the one heading style used by every landing section. */
export const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, body, align = 'center', className }) => (
  <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">{eyebrow}</p>
    <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.1] text-slate-900 sm:text-5xl">{title}</h2>
    {body && <p className="mt-4 text-lg leading-relaxed text-slate-600">{body}</p>}
  </div>
);
