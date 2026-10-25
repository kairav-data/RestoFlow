import { api, ApiError } from '@/lib/api';

export type ReportKind = 'orders' | 'daily' | 'dishes';
export interface DateRange {
  from: string;
  to: string;
}

export interface ReportSummary {
  totals: {
    orders: number;
    cancelled: number;
    parcels: number;
    revenue: number;
    avgOrderValue: number;
    subtotal: number;
    tax: number;
    serviceCharge: number;
    discount: number;
    collected: number;
    unpaid: number;
  };
  payments: { cash: number; upi: number; card: number; wallet: number };
  days: { date: string; orders: number; revenue: number }[];
  topDishes: { dish: string; category: string; quantity: number; orders: number; revenue: number }[];
}

export type PresetId = 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'last-month' | 'custom';

/** YYYY-MM-DD for a local calendar day. */
export const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const shift = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** Date range for a preset, using the device's calendar (the restaurant's own clock in practice). */
export function presetRange(id: Exclude<PresetId, 'custom'>, now = new Date()): DateRange {
  switch (id) {
    case 'today':
      return { from: isoDay(now), to: isoDay(now) };
    case 'yesterday':
      return { from: isoDay(shift(now, -1)), to: isoDay(shift(now, -1)) };
    case '7d':
      return { from: isoDay(shift(now, -6)), to: isoDay(now) };
    case '30d':
      return { from: isoDay(shift(now, -29)), to: isoDay(now) };
    case 'month':
      return { from: isoDay(new Date(now.getFullYear(), now.getMonth(), 1)), to: isoDay(now) };
    case 'last-month':
      return {
        from: isoDay(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        to: isoDay(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
  }
}

const query = (range: DateRange) => `from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;

export const fetchReportSummary = (range: DateRange) => api<ReportSummary>(`/api/portal/reports/summary?${query(range)}`);

/** Downloads a report as a CSV file. Errors come back as ApiError with a readable message. */
export async function downloadReport(kind: ReportKind, range: DateRange) {
  let res: Response;
  try {
    res = await fetch(`/api/portal/reports/export?kind=${kind}&${query(range)}`, { cache: 'no-store' });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(res.status, data?.error || 'Could not download the report.');
  }
  const filename = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') ?? '')?.[1] ?? `${kind}-report.csv`;
  const url = URL.createObjectURL(await res.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
