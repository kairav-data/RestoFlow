'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Download, FileSpreadsheet, Loader2, Lock, ReceiptText, UtensilsCrossed } from 'lucide-react';
import { AsyncButton } from '@/components/ui/AsyncButton';
import { ApiError } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import { useOwner } from '../context/OwnerContext';
import {
  downloadReport,
  fetchReportSummary,
  isoDay,
  presetRange,
  type DateRange,
  type PresetId,
  type ReportKind,
  type ReportSummary,
} from '../services/reports';
import { Kpi } from './Kpi';

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'custom', label: 'Custom' },
];

const DOWNLOADS: { kind: ReportKind; title: string; description: string; icon: typeof ReceiptText }[] = [
  {
    kind: 'orders',
    title: 'Order details',
    description: 'Every order with time, table or parcel, guest, items, taxes, total, status and how it was paid.',
    icon: ReceiptText,
  },
  {
    kind: 'daily',
    title: 'Daily revenue',
    description: 'One row per day: orders, cancellations, tax, service charge, revenue, and cash / UPI / card collected.',
    icon: CalendarDays,
  },
  {
    kind: 'dishes',
    title: 'Dish sales',
    description: 'Each dish and plate size with quantity sold, number of orders and revenue, best sellers first.',
    icon: UtensilsCrossed,
  },
];

const PAYMENT_LABELS = { cash: 'Cash', upi: 'UPI', card: 'Card', wallet: 'Wallet' } as const;

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const ReportsView: React.FC = () => {
  const { staff, notify } = useOwner();
  const canView = staff.role === 'owner' || staff.role === 'manager';
  const [preset, setPreset] = useState<PresetId>('7d');
  const [range, setRange] = useState<DateRange>(() => presetRange('7d'));
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!range.from || !range.to || range.from > range.to) return;
    setLoading(true);
    try {
      setSummary(await fetchReportSummary(range));
      setError('');
    } catch (err) {
      setSummary(null);
      setError(err instanceof ApiError ? err.message : 'Could not load the report.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    if (canView) void load();
  }, [load, canView]);

  const choosePreset = (id: PresetId) => {
    setPreset(id);
    if (id !== 'custom') setRange(presetRange(id));
  };

  const download = async (kind: ReportKind) => {
    try {
      await downloadReport(kind, range);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Could not download the report.', 'error');
    }
  };

  if (!canView) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Lock className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
          <h1 className="mt-3 text-base font-semibold text-slate-900">Reports are for owners and managers</h1>
          <p className="mt-1 text-sm text-slate-500">Ask your manager if you need revenue figures.</p>
        </div>
      </div>
    );
  }

  const invalid = !range.from || !range.to || range.from > range.to;
  const t = summary?.totals;
  const empty = summary && t && t.orders === 0 && t.cancelled === 0;
  const today = isoDay(new Date());

  return (
    <div className="min-h-screen flex-1 space-y-6 bg-slate-50 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">
            Review revenue and orders, then download them as spreadsheets for your accountant or records.
          </p>
        </div>
      </div>

      <section aria-label="Date range" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick ranges">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              aria-pressed={preset === p.id}
              onClick={() => choosePreset(p.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500',
                preset === p.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-slate-700">
            From
            <input
              type="date"
              value={range.from}
              max={today}
              onChange={(e) => {
                setPreset('custom');
                setRange((r) => ({ ...r, from: e.target.value }));
              }}
              className="mt-1 block rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none"
            />
          </label>
          <label className="text-xs font-medium text-slate-700">
            To
            <input
              type="date"
              value={range.to}
              max={today}
              onChange={(e) => {
                setPreset('custom');
                setRange((r) => ({ ...r, to: e.target.value }));
              }}
              className="mt-1 block rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none"
            />
          </label>
          <p className="pb-2 text-xs text-slate-500" aria-live="polite">
            {invalid ? (
              <span className="text-rose-600">The start date must be on or before the end date.</span>
            ) : range.from === range.to ? (
              longDate(range.from)
            ) : (
              `${longDate(range.from)} to ${longDate(range.to)}`
            )}
          </p>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {loading && !summary ? (
        <div className="flex justify-center p-12" aria-busy="true">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading" />
        </div>
      ) : (
        t &&
        summary && (
          <div className={cn('space-y-6 transition-opacity', loading && 'opacity-60')} aria-busy={loading}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi label="Revenue" value={formatCurrency(t.revenue)}>
                <span className="text-xs text-slate-500">Incl. {formatCurrency(t.tax)} tax</span>
              </Kpi>
              <Kpi label="Orders" value={String(t.orders)}>
                <span className="text-xs text-slate-500">
                  {t.parcels} parcel{t.parcels === 1 ? '' : 's'} · {t.cancelled} cancelled
                </span>
              </Kpi>
              <Kpi label="Average order" value={formatCurrency(t.avgOrderValue)}>
                <span className="text-xs text-slate-400">Per order, incl. taxes</span>
              </Kpi>
              <Kpi label="Collected" value={formatCurrency(t.collected)}>
                <span className={cn('text-xs', t.unpaid > 0 ? 'font-semibold text-amber-700' : 'text-slate-500')}>
                  {t.unpaid > 0 ? `${formatCurrency(t.unpaid)} not marked paid` : 'Everything is paid'}
                </span>
              </Kpi>
            </div>

            {empty ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <FileSpreadsheet className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-slate-900">No orders in this period</p>
                <p className="text-xs text-slate-500">Pick a different date range to see figures.</p>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-3">
                <section aria-labelledby="bill-title" className="rounded-xl border border-slate-200 bg-white p-5">
                  <h2 id="bill-title" className="text-base font-semibold text-slate-900">
                    Revenue breakdown
                  </h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    {(
                      [
                        ['Food & drinks', formatCurrency(t.subtotal)],
                        ['Tax', formatCurrency(t.tax)],
                        ['Service charge', formatCurrency(t.serviceCharge)],
                        ['Discounts', t.discount ? `− ${formatCurrency(t.discount)}` : formatCurrency(0)],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label} className="flex justify-between">
                        <dt className="text-slate-600">{label}</dt>
                        <dd className="tabular-nums text-slate-900">{value}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold">
                      <dt className="text-slate-900">Revenue</dt>
                      <dd className="tabular-nums text-slate-900">{formatCurrency(t.revenue)}</dd>
                    </div>
                  </dl>

                  <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Collected by</h3>
                  <dl className="mt-2 space-y-2 text-sm">
                    {(Object.keys(PAYMENT_LABELS) as (keyof typeof PAYMENT_LABELS)[]).map((m) => (
                      <div key={m} className="flex justify-between">
                        <dt className="text-slate-600">{PAYMENT_LABELS[m]}</dt>
                        <dd className="tabular-nums text-slate-900">{formatCurrency(summary.payments[m])}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section aria-labelledby="days-title" className="rounded-xl border border-slate-200 bg-white p-5">
                  <h2 id="days-title" className="text-base font-semibold text-slate-900">
                    By day
                  </h2>
                  <div className="mt-3 max-h-72 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white text-left text-xs text-slate-500">
                        <tr>
                          <th className="py-1.5 font-medium">Date</th>
                          <th className="py-1.5 text-right font-medium">Orders</th>
                          <th className="py-1.5 text-right font-medium">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...summary.days].reverse().map((d) => (
                          <tr key={d.date}>
                            <td className="py-1.5 text-slate-700">{longDate(d.date)}</td>
                            <td className="py-1.5 text-right tabular-nums text-slate-700">{d.orders}</td>
                            <td className="py-1.5 text-right tabular-nums text-slate-900">{formatCurrency(d.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section aria-labelledby="dishes-title" className="rounded-xl border border-slate-200 bg-white p-5">
                  <h2 id="dishes-title" className="text-base font-semibold text-slate-900">
                    Top dishes
                  </h2>
                  <p className="text-xs text-slate-500">By revenue in this period</p>
                  <ol className="mt-3 space-y-2 text-sm">
                    {summary.topDishes.map((d, i) => (
                      <li key={d.dish} className="flex items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-slate-800">
                          <span className="mr-2 text-xs font-semibold text-slate-400">{i + 1}</span>
                          {d.dish}
                        </span>
                        <span className="shrink-0 text-right text-xs text-slate-500">
                          {d.quantity} sold · <span className="font-semibold text-slate-900">{formatCurrency(d.revenue)}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            )}
          </div>
        )
      )}

      <section aria-labelledby="downloads-title" className="space-y-3">
        <div>
          <h2 id="downloads-title" className="text-base font-semibold text-slate-900">
            Download
          </h2>
          <p className="text-xs text-slate-500">CSV files open in Excel, Google Sheets and Numbers. Amounts are in {'₹'}.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {DOWNLOADS.map(({ kind, title, description, icon: Icon }) => (
            <div key={kind} className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <div>
                <Icon className="h-5 w-5 text-amber-600" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
              </div>
              <AsyncButton
                onClick={() => download(kind)}
                disabled={invalid}
                aria-label={`Download ${title} as CSV`}
                className="rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download CSV
              </AsyncButton>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
