'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Search, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import { CustomerHistoryPanel } from './CustomerHistoryPanel';

type Sort = 'recent' | 'spend' | 'visits' | 'newest';

interface CustomersData {
  summary: { total: number; newLast30Days: number; returning: number; totalSpent: number };
  customers: {
    id: string;
    customerCode: string;
    name: string;
    phone: string;
    email: string | null;
    visits: number;
    orders: number;
    totalSpent: number;
    firstVisitAt: string;
    lastVisitAt: string;
    tags: string[];
  }[];
}

const SORTS: { id: Sort; label: string }[] = [
  { id: 'recent', label: 'Most recent' },
  { id: 'spend', label: 'Top spenders' },
  { id: 'visits', label: 'Most visits' },
  { id: 'newest', label: 'Newest guests' },
];

const PAGE = 25;
const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/** Everyone who has ordered at this restaurant, with how often they visit and what they spend. */
export const CustomersView: React.FC = () => {
  const [data, setData] = useState<CustomersData | null>(null);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query.trim());
      setPage(0);
    }, 300);
    return () => window.clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    try {
      const qs = new URLSearchParams({ sort, limit: String(PAGE), offset: String(page * PAGE) });
      if (debounced) qs.set('q', debounced);
      setData(await api<CustomersData>(`/api/portal/customers?${qs}`));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load customers.');
    }
  }, [sort, page, debounced]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => document.visibilityState === 'visible' && void load(), 20000);
    return () => window.clearInterval(timer);
  }, [load]);

  const summary = data?.summary;
  const hasNext = data ? data.customers.length === PAGE : false;

  return (
    <div className="min-h-screen flex-1 space-y-6 bg-slate-50 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">Guests who have ordered from your table QR codes. Select a guest to see everything they have eaten.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total guests', String(summary.total)],
            ['New in 30 days', String(summary.newLast30Days)],
            ['Returning guests', String(summary.returning)],
            ['Lifetime spend', formatCurrency(summary.totalSpent)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-2 font-display text-3xl font-semibold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, mobile or ID"
              aria-label="Search customers"
              className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div role="group" aria-label="Sort customers" className="flex flex-wrap gap-1.5">
            {SORTS.map((s) => (
              <button
                key={s.id}
                aria-pressed={sort === s.id}
                onClick={() => {
                  setSort(s.id);
                  setPage(0);
                }}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  sort === s.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {!data ? (
          <div className="flex justify-center p-16" aria-busy="true">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading" />
          </div>
        ) : data.customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">{debounced ? 'No guests match your search' : 'No guests yet'}</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {debounced
                ? 'Try a different name or number.'
                : 'When a guest signs in with their mobile number and orders, they are added here automatically.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Guest</th>
                  <th className="px-4 py-3 font-medium">Guest ID</th>
                  <th className="px-4 py-3 font-medium">Mobile</th>
                  <th className="px-4 py-3 text-right font-medium">Visits</th>
                  <th className="px-4 py-3 text-right font-medium">Orders</th>
                  <th className="px-4 py-3 text-right font-medium">Spent</th>
                  <th className="px-4 py-3 font-medium">First visit</th>
                  <th className="px-4 py-3 font-medium">Last visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-semibold text-amber-700">
                          {c.name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <span>
                          <button
                            type="button"
                            onClick={() => setOpenId(c.id)}
                            className="block text-left font-medium text-slate-900 hover:text-amber-700 hover:underline focus:outline-none focus-visible:underline"
                          >
                            {c.name}
                          </button>
                          {c.visits > 1 && <span className="text-xs text-emerald-700">Returning guest</span>}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{c.customerCode}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.phone}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{c.visits}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{c.orders}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(c.totalSpent)}</td>
                    <td className="px-4 py-3 text-slate-600">{date(c.firstVisitAt)}</td>
                    <td className="px-4 py-3 text-slate-600">{date(c.lastVisitAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && (page > 0 || hasNext) && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-slate-500">Page {page + 1}</span>
            <button
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {openId && <CustomerHistoryPanel customerId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
};
