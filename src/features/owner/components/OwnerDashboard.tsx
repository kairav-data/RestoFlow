'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, BellRing, ChefHat, Loader2, Star, TrendingUp } from 'lucide-react';
import { useRestaurant } from '@/features/restaurants/context/RestaurantContext';
import { api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import { useOwner } from '../context/OwnerContext';
import { Kpi } from './Kpi';

type Range = 'today' | '7d' | '30d';

interface Stats {
  range: Range;
  kpis: {
    revenue: number;
    revenueChange: number | null;
    orders: number;
    ordersChange: number | null;
    avgOrderValue: number;
    customers: number;
    newCustomers: number;
    pendingPayments: number;
    rating: number | null;
    ratingCount: number;
  };
  series: { label: string; orders: number; revenue: number }[];
  topDishes: { name: string; image: string | null; quantity: number; revenue: number }[];
  openOrders: Record<string, number>;
}

const RANGES: { id: Range; label: string; title: string }[] = [
  { id: 'today', label: 'Today', title: 'today, by hour' },
  { id: '7d', label: '7 days', title: 'the last 7 days' },
  { id: '30d', label: '30 days', title: 'the last 30 days' },
];

const Change: React.FC<{ value: number | null }> = ({ value }) => {
  if (value === null) return <span className="text-xs text-slate-400">No earlier data</span>;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', up ? 'text-emerald-600' : 'text-rose-600')}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {Math.abs(value)}% vs previous period
    </span>
  );
};

const minutesAgo = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
};

export const OwnerDashboard: React.FC = () => {
  const restaurant = useRestaurant();
  const { staff, orders, setActiveSection } = useOwner();
  const [range, setRange] = useState<Range>('today');
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setStats(await api<Stats>(`/api/portal/stats?range=${range}`));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the dashboard.');
    }
  }, [range]);

  useEffect(() => {
    setStats(null);
    void load();
    const timer = window.setInterval(() => document.visibilityState === 'visible' && void load(), 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  const k = stats?.kpis;
  const rangeInfo = RANGES.find((r) => r.id === range)!;
  const live = {
    new: orders.filter((o) => o.status === 'new').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
  };
  const awaitingPayment = orders.filter((o) => o.status !== 'cancelled' && o.paymentStatus === 'pending').length;
  const recent = orders.slice(0, 8);

  return (
    <div className="min-h-screen flex-1 space-y-6 bg-slate-50 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-700">Welcome back, {staff.name.split(' ')[0]}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{restaurant.name}</h1>
        </div>
        <div role="tablist" aria-label="Time range" className="flex rounded-lg border border-slate-200 bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={range === r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
                range === r.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {(live.new > 0 || awaitingPayment > 0) && (
        <button
          onClick={() => setActiveSection('orders')}
          className="flex w-full items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left transition-colors hover:border-amber-400"
        >
          <BellRing className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <span className="text-sm text-slate-900">
            {live.new > 0 && (
              <strong>
                {live.new} new order{live.new > 1 ? 's' : ''}
              </strong>
            )}
            {live.new > 0 && awaitingPayment > 0 && ' and '}
            {awaitingPayment > 0 && (
              <strong>
                {awaitingPayment} guest{awaitingPayment > 1 ? 's' : ''} ready to pay
              </strong>
            )}
            <span className="text-slate-600"> {live.new + awaitingPayment > 1 ? 'are' : 'is'} waiting. Open live orders.</span>
          </span>
        </button>
      )}

      {!stats && !error ? (
        <div className="flex justify-center p-16" aria-busy="true">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading" />
        </div>
      ) : (
        stats &&
        k && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi label="Revenue" value={formatCurrency(k.revenue)}>
                <Change value={k.revenueChange} />
              </Kpi>
              <Kpi label="Orders" value={String(k.orders)}>
                <Change value={k.ordersChange} />
              </Kpi>
              <Kpi label="Average order" value={formatCurrency(k.avgOrderValue)}>
                <span className="text-xs text-slate-400">Per order, incl. taxes</span>
              </Kpi>
              <Kpi label="Guests" value={String(k.customers)}>
                <span className="text-xs text-slate-500">{k.newCustomers} new this period</span>
              </Kpi>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
              <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="sales-title">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 id="sales-title" className="text-base font-semibold text-slate-900">
                      Sales and orders
                    </h2>
                    <p className="text-xs text-slate-500">Showing {rangeInfo.title}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> Revenue
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-3 bg-amber-500" /> Orders
                    </span>
                  </div>
                </div>
                {stats.series.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                    <TrendingUp className="h-8 w-8 text-slate-300" aria-hidden="true" />
                    <p className="text-sm font-medium text-slate-700">No orders in this period</p>
                    <p className="max-w-xs text-xs text-slate-500">Sales appear here as soon as guests order from their tables.</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={stats.series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#E9E5E5" vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7A7272' }} />
                        <YAxis yAxisId="left" tickLine={false} axisLine={false} width={48} tick={{ fontSize: 11, fill: '#7A7272' }} />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          allowDecimals={false}
                          tickLine={false}
                          axisLine={false}
                          width={28}
                          tick={{ fontSize: 11, fill: '#7A7272' }}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => (name === 'Revenue' ? formatCurrency(value) : value)}
                          contentStyle={{ borderRadius: 12, border: '1px solid #E9E5E5', fontSize: 12 }}
                        />
                        <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#D6D0D0" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" dataKey="orders" name="Orders" stroke="#C8202F" strokeWidth={2.5} dot={{ r: 3 }} type="monotone" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="top-title">
                <h2 id="top-title" className="text-base font-semibold text-slate-900">
                  Top dishes
                </h2>
                <p className="mb-3 text-xs text-slate-500">By quantity ordered, {rangeInfo.title}</p>
                {stats.topDishes.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-500">No dishes ordered in this period.</p>
                ) : (
                  <ol className="divide-y divide-slate-100">
                    {stats.topDishes.map((d, i) => (
                      <li key={d.name} className="flex items-center gap-3 py-2.5">
                        <span className="w-4 text-center text-xs font-semibold text-slate-400">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900">{d.name}</span>
                          <span className="text-xs text-slate-500">{formatCurrency(d.revenue)}</span>
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{d.quantity}×</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
              <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="live-title">
                <h2 id="live-title" className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <ChefHat className="h-4 w-4 text-amber-600" aria-hidden="true" /> In the kitchen now
                </h2>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {(
                    [
                      ['New', live.new],
                      ['Preparing', live.preparing],
                      ['Ready', live.ready],
                    ] as const
                  ).map(([label, n]) => (
                    <div key={label} className="rounded-lg bg-slate-50 p-3">
                      <dd className="font-display text-2xl font-semibold text-slate-900">{n}</dd>
                      <dt className="text-xs text-slate-500">{label}</dt>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Star className="h-4 w-4 text-amber-500" aria-hidden="true" /> Guest rating
                  </span>
                  <span className="font-semibold text-slate-900">
                    {k.rating !== null ? `${k.rating} (${k.ratingCount})` : 'No reviews yet'}
                  </span>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="recent-title">
                <div className="mb-3 flex items-center justify-between">
                  <h2 id="recent-title" className="text-base font-semibold text-slate-900">
                    Recent orders
                  </h2>
                  <button onClick={() => setActiveSection('orders')} className="text-sm font-medium text-amber-700 hover:underline">
                    View all
                  </button>
                </div>
                {recent.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-500">No orders in the last 24 hours.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="pb-2 font-medium">Order</th>
                          <th className="pb-2 font-medium">Table</th>
                          <th className="pb-2 font-medium">Guest</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 text-right font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recent.map((o) => (
                          <tr key={o.id}>
                            <td className="py-2.5">
                              <span className="font-semibold text-slate-900">{o.orderNumber}</span>
                              <span className="block text-xs text-slate-400">{minutesAgo(o.createdAt)}</span>
                            </td>
                            <td className="py-2.5 text-slate-700">{o.tableNumber || (o.isParcel ? 'Parcel' : 'Counter')}</td>
                            <td className="py-2.5 text-slate-700">{o.customerName ?? 'Guest'}</td>
                            <td className="py-2.5">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                                {o.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-semibold text-slate-900">{formatCurrency(o.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </>
        )
      )}
    </div>
  );
};
