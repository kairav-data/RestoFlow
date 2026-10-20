import React from 'react';
import { Apple, ArrowRight, CakeSlice, Check, ChefHat, Coffee, Flame, Minus, Pizza, Plus, Search, Soup, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SAMPLE_DISHES, type AppScreenId } from '../data/content';

const Veg: React.FC<{ veg: boolean }> = ({ veg }) => (
  <span className={cn('inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border', veg ? 'border-emerald-600' : 'border-rose-600')}>
    <span className={cn('h-1.5 w-1.5 rounded-full', veg ? 'bg-emerald-600' : 'bg-rose-600')} />
  </span>
);

const Header: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <div className="px-4 pb-3 pt-1">
    <p className="font-display text-lg font-semibold leading-tight text-slate-900">{title}</p>
    {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
  </div>
);

const MenuScreen: React.FC = () => (
  <div>
    <Header title="Spice Route" sub="Table T12 · Bandra, Mumbai" />
    <div className="mx-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-[11px] text-slate-400">
      <Search className="h-3.5 w-3.5" /> Search dishes
    </div>
    <div className="mt-3 flex gap-1.5 overflow-hidden px-4 text-[10px] font-semibold">
      {['All', 'Starters', 'Mains', 'Breads'].map((c, i) => (
        <span key={c} className={cn('rounded-full px-3 py-1', i === 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600')}>
          {c}
        </span>
      ))}
    </div>
    <ul className="mt-3 space-y-2.5 px-4">
      {SAMPLE_DISHES.slice(0, 3).map((d, i) => (
        <li key={d.name} className="flex gap-3 rounded-2xl border border-slate-100 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.image} alt="" className="h-[68px] w-[68px] rounded-xl object-cover" loading="lazy" />
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div>
              <p className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
                <Veg veg={d.veg} /> {d.name}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-500">
                <Flame className="h-2.5 w-2.5 text-amber-500" /> {i === 1 ? 'Medium' : 'Mild'} · {320 + i * 40} kcal
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-extrabold text-slate-900">₹{d.price}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-white">
                <Plus className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
    <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-elevated">
      <span className="text-[11px] font-semibold">3 items · ₹1,001</span>
      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
        View cart <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  </div>
);

const CartScreen: React.FC = () => (
  <div className="flex h-[564px] flex-col">
    <Header title="Your order" sub="Table T12" />
    <ul className="space-y-2.5 px-4">
      {[
        { name: 'Paneer Tikka', size: 'Full plate', price: 560, qty: 2 },
        { name: 'Dal Tadka', size: 'Half plate', price: 110, qty: 1 },
        { name: 'Garlic Naan', size: '', price: 240, qty: 3 },
      ].map((l) => (
        <li key={l.name} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
          <div>
            <p className="text-[12px] font-bold text-slate-900">{l.name}</p>
            <p className="text-[10px] text-slate-500">{l.size || 'Regular'} · ₹{l.price}</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-1.5 py-1 text-[11px] font-bold">
            <Minus className="h-3 w-3 text-slate-500" /> {l.qty} <Plus className="h-3 w-3 text-slate-500" />
          </div>
        </li>
      ))}
    </ul>
    <div className="mt-auto space-y-1.5 border-t border-slate-100 px-4 pb-4 pt-3 text-[11px] text-slate-600">
      <p className="flex justify-between"><span>Subtotal</span><span>₹910</span></p>
      <p className="flex justify-between"><span>Taxes &amp; service</span><span>₹91</span></p>
      <p className="flex justify-between text-[13px] font-extrabold text-slate-900"><span>Total</span><span>₹1,001</span></p>
      <div className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-[12px] font-bold text-white">
        Send order to kitchen <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  </div>
);

const TrackScreen: React.FC = () => {
  const steps = [
    { label: 'Order received', done: true },
    { label: 'Being prepared', current: true },
    { label: 'Ready', done: false },
    { label: 'Served', done: false },
  ];
  return (
    <div>
      <Header title="Order #24" sub="Placed 2 minutes ago" />
      <div className="mx-4 flex items-center gap-3 rounded-2xl bg-amber-50 p-3">
        <ChefHat className="h-6 w-6 text-amber-600" />
        <div>
          <p className="text-[12px] font-bold text-slate-900">The chef is cooking</p>
          <p className="text-[10px] text-slate-600">About 12 minutes to go</p>
        </div>
      </div>
      <ol className="relative mx-4 mt-5 space-y-5 pl-7 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-0.5 before:bg-slate-200">
        {steps.map((s, i) => (
          <li key={s.label} className="relative">
            <span
              className={cn(
                'absolute -left-7 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ring-4 ring-white',
                s.done ? 'bg-emerald-500 text-white' : s.current ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400',
              )}
            >
              {s.done ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <p className={cn('text-[12px] font-bold', s.current ? 'text-amber-600' : s.done ? 'text-slate-900' : 'text-slate-400')}>{s.label}</p>
          </li>
        ))}
      </ol>
      <div className="mx-4 mt-6 flex items-center justify-between rounded-2xl bg-slate-900 p-3 text-white">
        <span className="text-[11px] font-semibold">Play while you wait</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
};

const PlayScreen: React.FC = () => {
  const cards = [Pizza, Soup, Coffee, Apple, CakeSlice, Utensils];
  const open = new Set([0, 3, 4, 7]);
  return (
    <div>
      <Header title="Food match" sub="Find the matching pairs" />
      <div className="mx-4 mb-3 flex gap-2 text-[10px]">
        <span className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold">Moves <span className="text-amber-600">7</span></span>
        <span className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold">Best <span className="text-slate-500">9</span></span>
      </div>
      <div className="mx-4 grid grid-cols-4 gap-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const Icon = cards[i % 6];
          const faceUp = open.has(i);
          return (
            <span
              key={i}
              className={cn(
                'flex aspect-square items-center justify-center rounded-xl border',
                faceUp ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-slate-200 bg-slate-900 text-transparent',
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
          );
        })}
      </div>
      <p className="mx-4 mt-4 rounded-xl bg-amber-50 p-3 text-[10px] leading-snug text-amber-900">
        Your food is being prepared. Games disappear once it is served.
      </p>
    </div>
  );
};

export const PhoneScreen: React.FC<{ screen: AppScreenId }> = ({ screen }) => {
  switch (screen) {
    case 'cart':
      return <CartScreen />;
    case 'track':
      return <TrackScreen />;
    case 'play':
      return <PlayScreen />;
    default:
      return <MenuScreen />;
  }
};
