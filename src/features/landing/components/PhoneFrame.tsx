import React from 'react';
import { cn } from '@/lib/utils';

/** A phone-shaped frame. The screen inside is a fixed 280 x 580 canvas so mock screens always lay out the same. */
export const PhoneFrame: React.FC<{ children: React.ReactNode; className?: string; label?: string }> = ({ children, className, label }) => (
  <div
    role="img"
    aria-label={label ?? 'RestoFlow guest app on a phone'}
    className={cn('relative mx-auto w-[300px] rounded-[2.75rem] border border-slate-800 bg-slate-900 p-[10px] shadow-elevated', className)}
  >
    <div className="absolute left-1/2 top-[18px] z-20 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-slate-900" aria-hidden="true" />
    <div className="relative h-[600px] w-full overflow-hidden rounded-[2.2rem] bg-white" aria-hidden="true">
      <div className="flex h-9 items-end justify-between px-6 pb-1 text-[10px] font-semibold text-slate-900">
        <span>9:41</span>
        <span className="tracking-wider">5G ▪▪▪</span>
      </div>
      {children}
    </div>
  </div>
);
