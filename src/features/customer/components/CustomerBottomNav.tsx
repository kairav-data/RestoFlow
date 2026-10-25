'use client';

import React from 'react';
import { Home, BookOpen, Sparkles, ShoppingBag, ReceiptText, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomer, CustomerScreen } from '../context/CustomerContext';

export const CustomerBottomNav: React.FC = () => {
  const { activeScreen, setActiveScreen, cartItemCount, activeOrder } = useCustomer();

  const items: { screen: CustomerScreen; label: string; icon: LucideIcon; badge?: number; dot?: boolean }[] = [
    { screen: 'home', label: 'Home', icon: Home },
    { screen: 'menu', label: 'Menu', icon: BookOpen },
    { screen: 'help-me-choose', label: 'Help me choose', icon: Sparkles },
    { screen: 'orders', label: 'My order', icon: ReceiptText, dot: Boolean(activeOrder && activeOrder.status !== 'served') },
    { screen: 'cart', label: 'Cart', icon: ShoppingBag, badge: cartItemCount > 0 ? cartItemCount : undefined },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)]"
      aria-label="Guest navigation"
    >
      <ul className="flex items-stretch justify-around">
        {items.map(({ screen, label, icon: Icon, badge, dot }) => {
          const active = activeScreen === screen;
          return (
            <li key={screen} className="flex-1">
              <button
                onClick={() => setActiveScreen(screen)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  active ? 'text-amber-700' : 'text-slate-500 hover:text-slate-800',
                )}
              >
                <span className="relative">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                  {badge ? (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  ) : null}
                  {dot ? <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" /> : null}
                </span>
                {label}
                {active && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-amber-500" />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
