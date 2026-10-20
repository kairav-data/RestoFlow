'use client';

import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type AsyncButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** May return a promise; the button shows a spinner and ignores clicks until it settles. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<unknown>;
  /** Force the loading state, e.g. when the work is driven from elsewhere. */
  loading?: boolean;
};

/** A button that shows a spinner while its click handler is running, so the user can see the click registered. */
export const AsyncButton: React.FC<AsyncButtonProps> = ({ onClick, loading, disabled, className, children, type = 'button', ...rest }) => {
  const [pending, setPending] = useState(false);
  const running = useRef(false);
  const busy = pending || Boolean(loading);

  const handle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (running.current || !onClick) return;
    running.current = true;
    setPending(true);
    try {
      await onClick(event);
    } finally {
      running.current = false;
      setPending(false);
    }
  };

  return (
    <button
      {...rest}
      type={type}
      onClick={handle}
      disabled={disabled || busy}
      aria-busy={busy}
      className={cn('inline-flex items-center justify-center gap-1.5 disabled:cursor-not-allowed', busy && 'opacity-80', className)}
    >
      {busy && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
};
