'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  label: string;
  className?: string;
}

const SIZE = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' } as const;

/** Read-only when `onChange` is omitted. Interactive version is a radiogroup for keyboard/screen-reader use. */
export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, size = 'md', label, className }) => {
  if (!onChange) {
    return (
      <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${label}: ${value.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(SIZE[size], s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
          />
        ))}
      </span>
    );
  }

  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={`${s} star${s > 1 ? 's' : ''}`}
          onClick={() => onChange(s)}
          className="rounded p-0.5 transition-transform active:scale-90"
        >
          <Star
            className={cn(SIZE[size], s <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300')}
          />
        </button>
      ))}
    </div>
  );
};
