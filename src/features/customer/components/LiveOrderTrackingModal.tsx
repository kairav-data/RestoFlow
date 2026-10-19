'use client';

import React from 'react';
import { CheckCircle2, ChefHat, Clock, Plus, Receipt, Sparkles, Utensils, XCircle } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { formatCurrency } from '@/lib/utils';
import { CustomerHeader } from './CustomerHeader';
import { PlayEntry } from '@/features/games/components/PlayEntry';
import type { Order, OrderStatus } from '@/types';

const STEPS: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: 'new', label: 'Order received', desc: 'Sent to the kitchen', icon: <CheckCircle2 className="h-4 w-4" /> },
  { key: 'preparing', label: 'Being prepared', desc: 'The chef is cooking your dishes', icon: <ChefHat className="h-4 w-4" /> },
  { key: 'ready', label: 'Ready', desc: 'Waiting to be brought to your table', icon: <Sparkles className="h-4 w-4" /> },
  { key: 'served', label: 'Served', desc: 'Enjoy your meal', icon: <Utensils className="h-4 w-4" /> },
];

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

const OrderCard: React.FC<{ order: Order; featured: boolean }> = ({ order, featured }) => {
  const cancelled = order.status === 'cancelled';
  const currentIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
            {cancelled ? 'Cancelled' : featured ? 'Live kitchen status' : 'Earlier order'}
          </p>
          <h2 className="text-lg font-black text-slate-900">Order {order.orderNumber}</h2>
          <p className="text-[11px] text-slate-500">Placed at {timeLabel(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-medium text-slate-500">Table</span>
          <p className="text-sm font-black text-slate-900">{order.tableNumber}</p>
        </div>
      </div>

      {cancelled ? (
        <p className="flex items-center gap-2 text-sm text-rose-700">
          <XCircle className="h-4 w-4" aria-hidden="true" /> The restaurant cancelled this order. Please ask the staff.
        </p>
      ) : (
        <ol className="relative space-y-5 pl-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-0.5 before:bg-slate-200">
          {STEPS.map((step, i) => {
            const past = i < currentIndex;
            const current = i === currentIndex;
            return (
              <li key={step.key} className="relative flex items-start gap-3">
                <span
                  className={`absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ring-4 ring-white ${
                    past ? 'bg-emerald-500 text-white' : current ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}
                  aria-hidden="true"
                >
                  {past ? '✓' : i + 1}
                </span>
                <div>
                  <h4 className={`text-xs font-bold ${current ? 'text-amber-600' : past ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                    {current && <span className="sr-only"> (current)</span>}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-slate-500">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
        {order.items.map((it) => (
          <div key={it.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{it.quantity}×</span>
              <span className="text-slate-800">{it.name}</span>
            </div>
            <span className="font-semibold text-slate-900">{formatCurrency(it.price * it.quantity)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-black">
          <span>Total (incl. taxes)</span>
          <span className="text-amber-600">{formatCurrency(order.total)}</span>
        </div>
        {order.paymentStatus === 'paid' && (
          <p className="text-[11px] font-semibold text-emerald-700">Paid</p>
        )}
      </div>
    </section>
  );
};

export const LiveOrderTrackingModal: React.FC = () => {
  const { orders, setActiveScreen } = useCustomer();

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-28 text-slate-850">
        <CustomerHeader title="Order status" showBack={true} />
        <div className="m-4 mx-auto max-w-md space-y-3 rounded-3xl border border-slate-200 bg-white p-6 py-16 text-center shadow-subtle">
          <Clock className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="text-base font-bold text-slate-900">No orders yet</h3>
          <p className="text-xs text-slate-500">Browse the menu and place an order to follow it here, live.</p>
          <button
            onClick={() => setActiveScreen('menu')}
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white"
          >
            Browse menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 text-slate-850">
      <CustomerHeader title="Your orders" showBack={true} />
      <main className="mx-auto max-w-md space-y-4 px-4 py-4" aria-live="polite">
        <PlayEntry />

        {orders.map((order, i) => (
          <OrderCard key={order.id} order={order} featured={i === 0} />
        ))}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setActiveScreen('menu')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            <span>Add more dishes</span>
          </button>
          <button
            onClick={() => setActiveScreen('bill')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-amber-600"
          >
            <Receipt className="h-4 w-4" />
            <span>View &amp; pay bill</span>
          </button>
        </div>
      </main>
    </div>
  );
};
