import React from 'react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

const MARK_SIZE = { sm: 28, md: 34, lg: 44 } as const;
const WORD_SIZE = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' } as const;

/** RestoFlow platform mark: a plate with a flowing line through it. */
export const RestoFlowMark: React.FC<{ size?: number; className?: string }> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
    <rect width="40" height="40" rx="12" fill="#C8202F" />
    <circle cx="20" cy="20" r="10.5" stroke="#FFFFFF" strokeWidth="2" />
    <path
      d="M11.5 21.5c3 -5 6 -5 8.5 -1.5s5.500 3.500 8.500 -1.500"
      stroke="#FFFFFF"
      strokeWidth="2.200"
      strokeLinecap="round"
    />
  </svg>
);

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className,
  theme = 'light',
  size = 'md',
  showWordmark = true,
}) => (
  <div className={cn('flex select-none items-center gap-2.5', className)}>
    <RestoFlowMark size={MARK_SIZE[size]} />
    {showWordmark && (
      <span
        className={cn(
          'font-display font-semibold leading-none tracking-tight',
          WORD_SIZE[size],
          theme === 'dark' ? 'text-white' : 'text-slate-900',
        )}
      >
        Resto<span className="text-amber-500">Flow</span>
      </span>
    )}
  </div>
);
