import React from 'react';
import { cn } from '@/lib/utils';
import { restaurantMonogram } from '../services/restaurantService';

interface RestaurantBrandProps {
  name: string;
  /** Uploaded logo; falls back to the monogram. */
  logo?: string;
  subtitle?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MONO = { sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-14 w-14 text-lg' } as const;
const NAME = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' } as const;

/** Restaurant identity: monogram plus the restaurant's own name. Used wherever a tenant is shown. */
export const RestaurantBrand: React.FC<RestaurantBrandProps> = ({
  name,
  logo,
  subtitle,
  theme = 'light',
  size = 'md',
  className,
}) => (
  <div className={cn('flex min-w-0 items-center gap-3', className)}>
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-lg border font-display font-semibold',
        MONO[size],
        theme === 'dark'
          ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
          : 'border-amber-300 bg-amber-50 text-amber-700',
      )}
      aria-hidden="true"
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-full w-full rounded-[inherit] object-cover" />
      ) : (
        restaurantMonogram(name)
      )}
    </div>
    <div className="min-w-0">
      <p
        className={cn(
          'truncate font-display font-semibold leading-tight',
          NAME[size],
          theme === 'dark' ? 'text-white' : 'text-slate-900',
        )}
      >
        {name}
      </p>
      {subtitle && (
        <p className={cn('truncate text-xs', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
          {subtitle}
        </p>
      )}
    </div>
  </div>
);
