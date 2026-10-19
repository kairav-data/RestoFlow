'use client';

import React, { useState } from 'react';
import { Brain, ChefHat, Grid2x2, LayoutGrid, Utensils, Worm, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomer } from '@/features/customer/context/CustomerContext';
import { CustomerHeader } from '@/features/customer/components/CustomerHeader';
import { MemoryGame } from './MemoryGame';
import { Game2048 } from './Game2048';
import { SnakeGame } from './SnakeGame';
import { OnlineGamesList } from './OnlineGamesList';

type GameId = 'memory' | '2048' | 'snake' | 'more';

const GAMES: { id: GameId; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'memory', label: 'Food match', hint: 'Find the matching pairs.', icon: Brain },
  { id: '2048', label: '2048', hint: 'Swipe to merge numbers.', icon: Grid2x2 },
  { id: 'snake', label: 'Snake', hint: 'Eat, grow, do not crash.', icon: Worm },
  { id: 'more', label: 'More', hint: 'Popular free games on other websites.', icon: LayoutGrid },
];

const STATUS_COPY = {
  new: 'Your order has reached the kitchen.',
  preparing: 'The chef is cooking your dishes.',
  ready: 'Your food is ready and on its way.',
} as const;

/** Mini games for guests whose food has not arrived yet. Only reachable while an order is in progress. */
export const PlayWhileYouWaitScreen: React.FC = () => {
  const { waitingOrder, setActiveScreen } = useCustomer();
  const [game, setGame] = useState<GameId>('memory');

  if (!waitingOrder) {
    return (
      <div className="min-h-screen bg-white pb-28">
        <CustomerHeader title="Play while you wait" showBack={true} />
        <div className="mx-auto mt-6 max-w-md space-y-3 rounded-3xl border border-slate-200 p-8 text-center">
          <Utensils className="mx-auto h-10 w-10 text-emerald-600" aria-hidden="true" />
          <h2 className="text-base font-bold text-slate-900">Your food has arrived</h2>
          <p className="text-xs text-slate-500">Games are only for the waiting time. Enjoy your meal.</p>
          <button onClick={() => setActiveScreen('orders')} className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white">
            Back to my order
          </button>
        </div>
      </div>
    );
  }

  const active = GAMES.find((g) => g.id === game)!;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <CustomerHeader title="Play while you wait" showBack={true} />
      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3" aria-live="polite">
          <ChefHat className="h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="text-xs font-medium text-amber-900">
            Order {waitingOrder.orderNumber}: {STATUS_COPY[waitingOrder.status as keyof typeof STATUS_COPY]}
          </p>
        </div>

        <div role="tablist" aria-label="Choose a game" className="grid grid-cols-4 gap-2">
          {GAMES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={game === id}
              onClick={() => setGame(id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors',
                game === id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-slate-500">{active.hint}</p>

        <section role="tabpanel" aria-label={active.label}>
          {game === 'memory' && <MemoryGame />}
          {game === '2048' && <Game2048 />}
          {game === 'snake' && <SnakeGame />}
          {game === 'more' && <OnlineGamesList />}
        </section>
      </main>
    </div>
  );
};
