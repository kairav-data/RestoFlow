'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Heart, Loader2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { fetchCustomerHistory, type CustomerHistory } from '../services/customerService';

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/** Slide-over with one guest's ID, totals, favourite dishes and every visit with what they ate. */
export const CustomerHistoryPanel: React.FC<{ customerId: string; onClose: () => void }> = ({ customerId, onClose }) => {
  const [data, setData] = useState<CustomerHistory | null>(null);
  const [error, setError] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let live = true;
    setData(null);
    setError('');
    fetchCustomerHistory(customerId)
      .then((d) => live && setData(d))
      .catch((err) => live && setError(err instanceof Error ? err.message : 'Could not load this guest.'));
    return () => {
      live = false;
    };
  }, [customerId]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Guest history"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">{data?.customer.name ?? 'Guest'}</h2>
            {data && (
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono font-semibold text-white">
                  {data.customer.customerCode}
                </span>
                {data.customer.email && <span>{data.customer.email}</span>}
                {data.customer.phone && <span className="font-mono">{data.customer.phone}</span>}
              </p>
            )}
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-slate-400 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {error && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
          {!data && !error && (
            <div className="flex justify-center py-16" aria-busy="true">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading" />
            </div>
          )}

          {data && (
            <>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Visits', String(data.stats.visits)],
                  ['Orders', String(data.stats.orders)],
                  ['Total spent', formatCurrency(data.stats.totalSpent)],
                  ['Avg. order', formatCurrency(Math.round(data.stats.averageOrder))],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-200 p-3">
                    <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</dt>
                    <dd className="mt-1 text-lg font-semibold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-slate-500">
                First visit {day(data.stats.firstVisitAt)} &middot; last visit {day(data.stats.lastVisitAt)}
              </p>

              {data.favourites.length > 0 && (
                <section aria-labelledby="fav-heading">
                  <h3 id="fav-heading" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                    <Heart className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" /> Most ordered
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {data.favourites.map((f) => (
                      <li key={f.menuItemId} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                        {f.name} <span className="text-slate-400">x{f.times}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section aria-labelledby="visits-heading">
                <h3 id="visits-heading" className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">
                  Visit history
                </h3>
                {data.visits.length === 0 ? (
                  <p className="text-sm text-slate-500">No orders recorded yet.</p>
                ) : (
                  <ol className="space-y-4">
                    {data.visits.map((visit) => (
                      <li key={visit.id} className="rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs">
                          <span className="font-semibold text-slate-800">
                            {dateTime(visit.startedAt)}
                            {visit.tableName && <span className="font-normal text-slate-500"> &middot; Table {visit.tableName}</span>}
                          </span>
                          <span className="font-semibold text-slate-900">{formatCurrency(visit.spent)}</span>
                        </div>
                        <ul className="divide-y divide-slate-100">
                          {visit.orders.map((order) => (
                            <li key={order.id} className="px-4 py-3 text-sm">
                              <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                                <span>
                                  Order #{order.orderNumber}
                                  <span className="ml-2 capitalize">{order.status}</span>
                                  {order.paid && <span className="ml-2 font-semibold text-emerald-700">Paid</span>}
                                </span>
                                <span>{formatCurrency(order.total)}</span>
                              </div>
                              <ul className="space-y-0.5 text-slate-700">
                                {order.items.map((item, i) => (
                                  <li key={i} className="flex justify-between gap-3">
                                    <span>
                                      {item.quantity} x {item.name}
                                    </span>
                                    <span className="text-slate-500">{formatCurrency(item.total)}</span>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};
