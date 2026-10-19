'use client';

import React, { useState } from 'react';
import { Banknote, BellRing, CheckCircle2, Printer, Search, UtensilsCrossed } from 'lucide-react';
import { useOwner } from '../context/OwnerContext';
import { formatCurrency } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const COLUMNS: { status: OrderStatus; label: string; badge: string }[] = [
  { status: 'new', label: 'Incoming', badge: 'bg-blue-100 text-blue-800' },
  { status: 'preparing', label: 'In kitchen', badge: 'bg-amber-100 text-amber-800' },
  { status: 'ready', label: 'Ready to serve', badge: 'bg-emerald-100 text-emerald-800' },
  { status: 'served', label: 'Served', badge: 'bg-slate-100 text-slate-700' },
];

const ago = (iso: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
};

const PAY_LABEL = { upi: 'UPI', card: 'Card', cash: 'Cash', wallet: 'Wallet' } as const;

const PaymentRow: React.FC<{ order: Order }> = ({ order }) => {
  const { markPaid } = useOwner();
  if (order.status === 'cancelled') return null;

  if (order.paymentStatus === 'paid') {
    return (
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Paid{order.paymentMethod ? ` · ${PAY_LABEL[order.paymentMethod]}` : ''}
      </p>
    );
  }

  const requested = order.paymentStatus === 'pending';
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 ${requested ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-slate-50'}`}
    >
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
        {requested ? <BellRing className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" /> : <Banknote className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
        {requested ? `Wants to pay by ${order.paymentMethod ? PAY_LABEL[order.paymentMethod] : 'cash'}` : 'Unpaid'}
      </span>
      <button
        onClick={() => markPaid(order.id, order.paymentMethod ?? 'cash')}
        className="rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800"
      >
        Mark paid
      </button>
    </div>
  );
};

export const LiveOrdersKdsView: React.FC = () => {
  const { orders, ordersLoaded, updateOrderStatus } = useOwner();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOrders = orders.filter((o) => {
    if (o.status === 'cancelled') return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.tableNumber.toLowerCase().includes(q) ||
      (o.customerName?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="min-h-screen flex-1 space-y-6 bg-slate-50 p-6 text-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Live orders</h2>
          <p className="text-xs text-slate-500">
            Orders from your table QR codes appear here within seconds. Showing the last 24 hours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search table, order #, guest…"
              aria-label="Search orders"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {ordersLoaded && orders.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <UtensilsCrossed className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">No orders yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            When a guest scans a table QR and orders, the ticket shows up here automatically.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.status === col.status);
          return (
            <section
              key={col.status}
              aria-label={col.label}
              className="flex min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-slate-100/70 p-3"
            >
              <div className="flex items-center gap-2 px-1 pb-3">
                <h3 className="text-xs font-bold text-slate-900">{col.label}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${col.badge}`}>{colOrders.length}</span>
              </div>

              <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto">
                {colOrders.length === 0 ? (
                  <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-xs font-medium text-slate-400">
                    Nothing here
                  </div>
                ) : (
                  colOrders.map((ord) => (
                    <article
                      key={ord.id}
                      className="space-y-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-subtle transition-colors hover:border-amber-400"
                    >
                      <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-950">Table {ord.tableNumber}</span>
                            <span className="text-[10px] font-semibold text-slate-500">{ord.orderNumber}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{ago(ord.createdAt)}</span>
                          {ord.customerName && (
                            <p className="mt-0.5 text-[11px] text-slate-600">
                              {ord.customerName}
                              {ord.customerPhone ? ` · ${ord.customerPhone}` : ''}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">{formatCurrency(ord.total)}</span>
                      </div>

                      <ul className="space-y-1.5 text-xs">
                        {ord.items.map((it) => (
                          <li key={it.id} className="flex items-start justify-between">
                            <span className="font-medium text-slate-800">
                              <span className="mr-1.5 font-bold text-amber-600">{it.quantity}×</span>
                              {it.name}
                            </span>
                            <span className="text-[11px] text-slate-500">{formatCurrency(it.price * it.quantity)}</span>
                          </li>
                        ))}
                      </ul>

                      <PaymentRow order={ord} />

                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                        {ord.status === 'new' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => updateOrderStatus(ord.id, 'preparing')}
                              className="flex-1 rounded-lg bg-amber-500 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-600"
                            >
                              Accept &amp; start prep
                            </button>
                          </>
                        )}
                        {ord.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'ready')}
                            className="w-full rounded-lg bg-emerald-500 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
                          >
                            Mark ready
                          </button>
                        )}
                        {ord.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'served')}
                            className="w-full rounded-lg bg-slate-800 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-900"
                          >
                            Mark served
                          </button>
                        )}
                        {ord.status === 'served' && (
                          <span className="w-full rounded-lg bg-emerald-50 py-1 text-center text-[11px] font-bold text-emerald-700">
                            Completed
                          </span>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
