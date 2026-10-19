import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ONLINE_GAMES } from '../utils/onlineGames';

/** Suggestions for popular free browser games. They are third-party sites, so each opens in its own tab. */
export const OnlineGamesList: React.FC = () => (
  <section aria-labelledby="online-games-heading" className="space-y-3 pt-2">
    <div>
      <h2 id="online-games-heading" className="text-sm font-bold text-slate-900">
        More games online
      </h2>
      <p className="text-xs text-slate-500">Free games on other websites. They open in a new tab, so your order stays here.</p>
    </div>
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {ONLINE_GAMES.map((game) => (
        <li key={game.name}>
          <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 transition-colors active:bg-slate-50"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-slate-900">{game.name}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">{game.genre}</span>
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">{game.blurb}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" aria-label="Opens in a new tab" />
          </a>
        </li>
      ))}
    </ul>
    <p className="text-[11px] text-slate-400">Some of these games include ads or online chat and are run by other companies.</p>
  </section>
);
