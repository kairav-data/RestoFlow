import React from 'react';
import { RotateCcw } from 'lucide-react';

/** Score line shared by every game, with a restart button. */
export const GameStats: React.FC<{ items: [string, string][]; onRestart: () => void }> = ({ items, onRestart }) => (
  <div className="flex items-center justify-between gap-3">
    <dl className="flex gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-[72px] rounded-xl border border-slate-200 bg-white px-3 py-1.5">
          <dt className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</dt>
          <dd className="text-sm font-extrabold text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
    <button
      type="button"
      onClick={onRestart}
      aria-label="Restart game"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 active:scale-95"
    >
      <RotateCcw className="h-4 w-4" />
    </button>
  </div>
);
