'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { GRID, newSnake, step, turn, type Dir, type SnakeState } from '../utils/snake';
import { readBest, saveBest } from '../utils/bestScore';
import { useSwipe } from '../hooks/useSwipe';
import { GameStats } from './GameStats';

const TICK_MS = 130;
const CELL = 20;
const KEYS: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
const COLORS = { board: '#f8fafc', grid: '#eef2f7', snake: '#0f172a', head: '#C8202F', food: '#C8202F' };

/** Classic snake: swipe or use the arrows, eat to grow, avoid walls and yourself. */
export const SnakeGame: React.FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef<SnakeState | null>(null);
  const wanted = useRef<Dir>('right');
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState<number | null>(null);

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext('2d');
    const s = state.current;
    if (!ctx || !s) return;
    ctx.fillStyle = COLORS.board;
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);
    ctx.fillStyle = COLORS.grid;
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) if ((x + y) % 2 === 0) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    s.snake.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? COLORS.head : COLORS.snake;
      ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const restart = useCallback(() => {
    state.current = newSnake();
    wanted.current = 'right';
    setScore(0);
    setOver(false);
    setStarted(false);
    draw();
  }, [draw]);

  useEffect(() => {
    restart();
    setBest(readBest('snake'));
  }, [restart]);

  const steer = useCallback((dir: Dir) => {
    if (!state.current) return;
    wanted.current = turn(state.current, dir);
    setStarted(true);
  }, []);

  useEffect(() => {
    if (!started || over) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || !state.current) return;
      const next = step(state.current, wanted.current);
      state.current = next;
      setScore(next.score);
      if (next.over) {
        setOver(true);
        setBest(saveBest('snake', next.score));
      }
      draw();
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [started, over, draw]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEYS[e.key];
      if (dir) {
        e.preventDefault();
        steer(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steer]);

  const swipe = useSwipe(steer, 16);
  const pad = (dir: Dir, Icon: typeof ArrowUp, label: string, cls: string) => (
    <button
      type="button"
      onClick={() => steer(dir)}
      aria-label={label}
      className={`flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 active:scale-95 active:bg-slate-100 ${cls}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );

  return (
    <div className="space-y-4">
      <GameStats items={[['Score', String(score)], ['Best', best === null ? '-' : String(best)]]} onRestart={restart} />
      <div {...swipe} className="relative touch-none select-none overflow-hidden rounded-2xl border border-slate-200">
        <canvas ref={canvas} width={GRID * CELL} height={GRID * CELL} className="block w-full" aria-label="Snake board" />
        {!started && !over && (
          <p className="absolute inset-x-0 bottom-3 text-center text-xs font-semibold text-slate-600">Swipe or tap an arrow to start</p>
        )}
        {over && (
          <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85">
            <p className="text-base font-extrabold text-slate-900">Game over - {score} points</p>
            <button onClick={restart} className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white">
              Play again
            </button>
          </div>
        )}
      </div>
      <div className="mx-auto grid w-40 grid-cols-3 grid-rows-2 gap-1.5">
        {pad('up', ArrowUp, 'Up', 'col-start-2')}
        {pad('left', ArrowLeft, 'Left', 'col-start-1 row-start-2')}
        {pad('down', ArrowDown, 'Down', 'col-start-2 row-start-2')}
        {pad('right', ArrowRight, 'Right', 'col-start-3 row-start-2')}
      </div>
    </div>
  );
};
