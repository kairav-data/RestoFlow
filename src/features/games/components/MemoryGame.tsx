'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Apple, Cake, Coffee, Cookie, IceCream, Pizza, RotateCcw, Sandwich, Soup, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { newDeck, PAIRS, type MemoryCard } from '../utils/memory';
import { readBest, saveBest } from '../utils/bestScore';
import { GameStats } from './GameStats';

const ICONS: { icon: LucideIcon; name: string }[] = [
  { icon: Pizza, name: 'pizza' },
  { icon: Soup, name: 'soup' },
  { icon: Cookie, name: 'cookie' },
  { icon: Coffee, name: 'coffee' },
  { icon: IceCream, name: 'ice cream' },
  { icon: Sandwich, name: 'sandwich' },
  { icon: Apple, name: 'apple' },
  { icon: Cake, name: 'cake' },
];
const FLIP_BACK_MS = 800;

/** Find the matching food pairs in as few moves as possible. */
export const MemoryGame: React.FC = () => {
  // The deck is shuffled after mount so server and browser render the same first frame.
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const lock = useRef(false);
  const done = cards.length > 0 && cards.every((c) => c.matched);

  useEffect(() => {
    setCards(newDeck());
    setBest(readBest('memory'));
  }, []);
  useEffect(() => {
    if (done && moves > 0) setBest(saveBest('memory', moves, true));
  }, [done, moves]);

  const flip = useCallback(
    (id: number) => {
      if (lock.current || open.includes(id) || cards[id]?.matched) return;
      const next = [...open, id];
      setOpen(next);
      if (next.length < 2) return;
      setMoves((m) => m + 1);
      const [a, b] = next.map((i) => cards.find((c) => c.id === i)!);
      if (a.pair === b.pair) {
        setCards((prev) => prev.map((c) => (c.pair === a.pair ? { ...c, matched: true } : c)));
        setOpen([]);
      } else {
        lock.current = true;
        window.setTimeout(() => {
          setOpen([]);
          lock.current = false;
        }, FLIP_BACK_MS);
      }
    },
    [cards, open],
  );

  const restart = () => {
    lock.current = false;
    setCards(newDeck());
    setOpen([]);
    setMoves(0);
  };

  return (
    <div className="space-y-4">
      <GameStats items={[['Moves', String(moves)], ['Best', best === null ? '-' : `${best} moves`]]} onRestart={restart} />
      <div className="grid grid-cols-4 gap-2.5">
        {cards.map((card) => {
          const { icon: Icon, name } = ICONS[card.pair % ICONS.length];
          const faceUp = card.matched || open.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(card.id)}
              aria-label={faceUp ? `Card: ${name}` : 'Hidden card'}
              className={cn(
                'flex aspect-square items-center justify-center rounded-xl border transition-all duration-200 active:scale-95',
                faceUp
                  ? card.matched
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                    : 'border-amber-300 bg-amber-50 text-amber-600'
                  : 'border-slate-200 bg-slate-900 text-transparent',
              )}
            >
              <Icon className="h-7 w-7" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      {done && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-sm font-bold text-emerald-800">
            All {PAIRS} pairs found in {moves} moves.
          </p>
          <button onClick={restart} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 underline">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Play again
          </button>
        </div>
      )}
    </div>
  );
};
