'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { hasMoves, highestTile, move, newGame, type Board, type Direction } from '../utils/game2048';
import { readBest, saveBest } from '../utils/bestScore';
import { useSwipe } from '../hooks/useSwipe';
import { GameStats } from './GameStats';

const TILE: Record<number, string> = {
  0: 'bg-slate-100 text-transparent',
  2: 'bg-white text-slate-700 border border-slate-200',
  4: 'bg-amber-50 text-amber-800',
  8: 'bg-amber-100 text-amber-900',
  16: 'bg-amber-200 text-amber-900',
  32: 'bg-amber-300 text-amber-950',
  64: 'bg-amber-400 text-white',
  128: 'bg-amber-500 text-white',
  256: 'bg-amber-600 text-white',
  512: 'bg-rose-600 text-white',
  1024: 'bg-rose-700 text-white',
  2048: 'bg-slate-900 text-white',
};

const KEYS: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

/** Swipe to merge matching numbers and reach 2048. */
export const Game2048: React.FC = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number | null>(null);

  // Random start tiles are created after mount so server and browser render the same first frame.
  useEffect(() => {
    setBoard(newGame());
    setBest(readBest('2048'));
  }, []);

  const over = board !== null && !hasMoves(board);

  const slide = useCallback(
    (dir: Direction) => {
      if (!board || over) return;
      const res = move(board, dir);
      if (!res.moved) return;
      setBoard(res.board);
      const total = score + res.gained;
      setScore(total);
      if (res.gained > 0) setBest(saveBest('2048', total));
    },
    [board, over, score],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEYS[e.key];
      if (dir) {
        e.preventDefault();
        slide(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slide]);

  const swipe = useSwipe(slide);
  const restart = () => {
    setBoard(newGame());
    setScore(0);
  };

  if (!board) return null;

  return (
    <div className="space-y-4">
      <GameStats items={[['Score', String(score)], ['Best', best === null ? '-' : String(best)]]} onRestart={restart} />
      <div
        {...swipe}
        role="application"
        aria-label="2048 board. Swipe or use arrow keys to move tiles."
        className="grid touch-none select-none grid-cols-4 gap-2 rounded-2xl bg-slate-200 p-2"
      >
        {board.flat().map((v, i) => (
          <div
            key={i}
            className={cn(
              'flex aspect-square items-center justify-center rounded-lg font-extrabold transition-colors',
              v >= 1024 ? 'text-lg' : 'text-xl',
              TILE[v] ?? TILE[2048],
            )}
          >
            {v || ''}
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500">Swipe in any direction. Highest tile: {highestTile(board)}</p>
      {over && (
        <div role="status" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
          <p className="text-sm font-bold text-rose-800">No more moves. You scored {score}.</p>
          <button onClick={restart} className="mt-2 text-xs font-semibold text-rose-700 underline">
            Play again
          </button>
        </div>
      )}
    </div>
  );
};
