'use client';

import React from 'react';
import { ChevronRight, Gamepad2 } from 'lucide-react';
import { useCustomer } from '@/features/customer/context/CustomerContext';

/** Invitation to play. Renders nothing unless the guest has an order the kitchen is still working on. */
export const PlayEntry: React.FC<{ variant?: 'card' | 'pill' }> = ({ variant = 'card' }) => {
  const { waitingOrder, setActiveScreen } = useCustomer();
  if (!waitingOrder) return null;

  if (variant === 'pill') {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-30 mx-auto flex max-w-md justify-center px-4">
        <button
          onClick={() => setActiveScreen('play')}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-lg active:scale-95"
        >
          <Gamepad2 className="h-4 w-4" aria-hidden="true" />
          Waiting for your food? Play a game
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setActiveScreen('play')}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-900 p-4 text-left text-white"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <Gamepad2 className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold">Play while you wait</span>
        <span className="block text-xs text-slate-300">Quick games to pass the time until your food arrives.</span>
      </span>
      <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
    </button>
  );
};
