'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, Download, ExternalLink, Plus, Printer, Trash2, Users } from 'lucide-react';
import { useRestaurant } from '@/features/restaurants/context/RestaurantContext';
import type { RestaurantTable } from '@/features/restaurants/types';
import { QrTentCard } from '@/features/qr/components/QrTentCard';
import { guestPath, guestUrl } from '@/features/qr/services/qrLinks';
import { downloadBlob, qrPngDataUrl, qrSvgString } from '@/features/qr/services/qrImage';
import { api, ApiError } from '@/lib/api';
import { tableInputSchema, type TableInput } from '@/features/tables/types';
import { readJson, writeJson } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useOwner } from '../context/OwnerContext';

const BASE_URL_KEY = 'restoflow:base-url';

export const TableQrManagementView: React.FC = () => {
  const restaurant = useRestaurant();
  const { selectedBranch } = useOwner();

  const { notify } = useOwner();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>(() =>
    readJson<string>(BASE_URL_KEY, typeof window !== 'undefined' ? window.location.origin : ''),
  );
  const [qrByTable, setQrByTable] = useState<Record<string, string>>({});
  const [printMode, setPrintMode] = useState<'single' | 'all' | null>(null);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableInput>({ resolver: zodResolver(tableInputSchema), defaultValues: { name: '', capacity: 4 } });

  useEffect(() => {
    api<{ tables: RestaurantTable[] }>('/api/portal/tables')
      .then((d) => {
        setTables(d.tables);
        setSelectedId((cur) => cur || d.tables[0]?.id || '');
      })
      .catch((err) => setFormError(err instanceof ApiError ? err.message : 'Could not load tables.'))
      .finally(() => setLoaded(true));
  }, []);

  const selected = tables.find((t) => t.id === selectedId) ?? tables[0];
  const urlFor = (t: RestaurantTable) => guestUrl(baseUrl, restaurant.slug, t.name);
  const isLocalhost = /localhost|127\.0\.0\.1/.test(baseUrl);

  // Regenerate QR images when the table list or public base URL changes.
  useEffect(() => {
    let cancelled = false;
    Promise.all(tables.map(async (t) => [t.id, await qrPngDataUrl(guestUrl(baseUrl, restaurant.slug, t.name))] as const)).then(
      (pairs) => {
        if (!cancelled) setQrByTable(Object.fromEntries(pairs));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [tables, baseUrl, restaurant.slug]);

  // Print once the print sheet has rendered.
  useEffect(() => {
    if (!printMode) return;
    const handle = window.setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 50);
    return () => window.clearTimeout(handle);
  }, [printMode]);

  const updateBaseUrl = (value: string) => {
    setBaseUrl(value);
    writeJson(BASE_URL_KEY, value);
  };

  const onAdd = async (values: TableInput) => {
    try {
      const res = await api<{ tables: RestaurantTable[] }>('/api/portal/tables', { method: 'POST', body: values });
      setFormError('');
      setTables(res.tables);
      const added = res.tables.find((t) => t.name.toLowerCase() === values.name.trim().toLowerCase());
      if (added) setSelectedId(added.id);
      reset({ name: '', capacity: values.capacity });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not add the table.');
    }
  };

  const onDelete = async (id: string) => {
    const table = tables.find((t) => t.id === id);
    if (!table || !window.confirm(`Remove table ${table.name}? Its printed QR code will stop working.`)) return;
    try {
      const res = await api<{ tables: RestaurantTable[] }>(`/api/portal/tables/${id}`, { method: 'DELETE' });
      setTables(res.tables);
      if (selectedId === id) setSelectedId(res.tables[0]?.id ?? '');
      notify(`Table ${table.name} removed.`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Could not remove the table.', 'error');
    }
  };

  const onCopy = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(urlFor(selected));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the link is visible on the card */
    }
  };

  const fileStem = useMemo(
    () => (selected ? `${restaurant.slug}-${selected.id}-qr` : 'qr'),
    [restaurant.slug, selected],
  );

  const printTables = printMode === 'all' ? tables : selected ? [selected] : [];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Tables &amp; QR codes</h2>
          <p className="mt-1 text-sm text-slate-500">
            {restaurant.name} · {selectedBranch} · {tables.length} tables. Each QR opens {restaurant.name}&apos;s menu for that table.
          </p>
        </div>
        <button
          onClick={() => setPrintMode('all')}
          disabled={tables.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 disabled:opacity-50"
        >
          <Printer className="h-4 w-4" /> Print all cards
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label htmlFor="base-url" className="text-sm font-medium text-slate-800">
          Public address guests will open
        </label>
        <input
          id="base-url"
          value={baseUrl}
          onChange={(e) => updateBaseUrl(e.target.value)}
          className="mt-2 w-full max-w-xl rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-amber-500 focus:outline-none"
        />
        {isLocalhost && (
          <p className="mt-2 text-xs text-amber-800">
            Phones cannot open localhost. Before printing, replace this with your live domain (or your computer&apos;s network
            address while testing).
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7" aria-label="Tables">
          <form onSubmit={handleSubmit(onAdd)} className="flex flex-wrap items-start gap-3" noValidate>
            <div className="min-w-[10rem] flex-1">
              <label htmlFor="table-name" className="mb-1 block text-xs font-medium text-slate-600">
                Table name
              </label>
              <input
                id="table-name"
                placeholder="e.g. Terrace 3"
                aria-invalid={Boolean(errors.name)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                {...register('name', { onChange: () => setFormError('') })}
              />
            </div>
            <div className="w-24">
              <label htmlFor="table-seats" className="mb-1 block text-xs font-medium text-slate-600">
                Seats
              </label>
              <input
                id="table-seats"
                type="number"
                min={1}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                {...register('capacity', { valueAsNumber: true })}
              />
            </div>
            <button
              type="submit"
              className="mt-[22px] inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Add table
            </button>
            {(errors.name || errors.capacity || formError) && (
              <p role="alert" className="w-full text-sm text-rose-600">
                {errors.name?.message ?? errors.capacity?.message ?? formError}
              </p>
            )}
          </form>

          {!loaded ? (
            <p className="p-8 text-center text-sm text-slate-500" aria-busy="true">Loading tables…</p>
          ) : tables.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No tables yet. Add your first table to generate its QR code.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {tables.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedId(t.id)}
                    aria-pressed={selected?.id === t.id}
                    className={cn(
                      'flex h-24 w-full flex-col justify-between rounded-lg border p-3 text-left transition-colors',
                      selected?.id === t.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 bg-white hover:border-slate-400',
                    )}
                  >
                    <span className="truncate font-display text-lg font-semibold text-slate-900">{t.name}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Users className="h-3 w-3" /> {t.capacity} seats
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="lg:col-span-5" aria-label="Selected table QR">
          {selected ? (
            <div className="flex flex-col items-center gap-5 rounded-xl border border-slate-200 bg-white p-6">
              <QrTentCard
                restaurantName={restaurant.name}
                logo={restaurant.logo}
                tableName={selected.name}
                qrDataUrl={qrByTable[selected.id]}
                url={urlFor(selected)}
              />

              <div className="grid w-full max-w-xs grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const png = qrByTable[selected.id];
                    if (!png) return;
                    fetch(png)
                      .then((r) => r.blob())
                      .then((blob) => downloadBlob(`${fileStem}.png`, blob));
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-amber-400"
                >
                  <Download className="h-4 w-4" /> PNG
                </button>
                <button
                  onClick={async () => {
                    const svg = await qrSvgString(urlFor(selected));
                    downloadBlob(`${fileStem}.svg`, new Blob([svg], { type: 'image/svg+xml' }));
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-amber-400"
                >
                  <Download className="h-4 w-4" /> SVG
                </button>
                <button
                  onClick={() => setPrintMode('single')}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800 hover:border-slate-400"
                >
                  <Printer className="h-4 w-4" /> Print card
                </button>
                <button
                  onClick={onCopy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800 hover:border-slate-400"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <a
                  href={guestPath(restaurant.slug, selected.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800 hover:border-slate-400"
                >
                  <ExternalLink className="h-4 w-4" /> Preview as guest
                </a>
                <button
                  onClick={() => onDelete(selected.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
              Select or add a table to see its QR code.
            </div>
          )}
        </aside>
      </div>

      {/* Print sheet: only this is visible when printing */}
      {printMode && (
        <div className="print-area hidden print:grid print:grid-cols-2 print:gap-6 print:p-6">
          {printTables.map((t) => (
            <QrTentCard
              key={t.id}
              restaurantName={restaurant.name}
                logo={restaurant.logo}
              tableName={t.name}
              qrDataUrl={qrByTable[t.id]}
              url={urlFor(t)}
              className="break-inside-avoid"
            />
          ))}
        </div>
      )}
    </div>
  );
};
