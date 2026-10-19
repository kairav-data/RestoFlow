import React from 'react';
import { ScanLine } from 'lucide-react';
import { RestaurantBrand } from '@/features/restaurants/components/RestaurantBrand';
import { cn } from '@/lib/utils';

interface QrTentCardProps {
  restaurantName: string;
  logo?: string;
  tableName: string;
  qrDataUrl?: string;
  url: string;
  className?: string;
}

/** Printable table card: restaurant identity, the QR for this table, and a scan instruction. */
export const QrTentCard: React.FC<QrTentCardProps> = ({ restaurantName, logo, tableName, qrDataUrl, url, className }) => (
  <div
    className={cn(
      'flex w-full max-w-xs flex-col items-center gap-4 rounded-xl border-2 border-amber-400 bg-white p-6 text-center text-slate-900',
      className,
    )}
  >
    <RestaurantBrand name={restaurantName} logo={logo} size="sm" className="justify-center" />

    <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-slate-200 bg-white p-2">
      {qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrDataUrl} alt={`QR code for ${restaurantName}, table ${tableName}`} className="h-full w-full" />
      ) : (
        <div className="h-full w-full animate-shimmer rounded-md" aria-label="Generating QR code" />
      )}
    </div>

    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Table</p>
      <p className="font-display text-3xl font-semibold leading-tight">{tableName}</p>
    </div>

    <p className="flex items-center gap-2 text-sm text-slate-600">
      <ScanLine className="h-4 w-4 text-amber-600" /> Scan to view the menu and order
    </p>
    <p className="break-all text-[10px] text-slate-400">{url}</p>
  </div>
);
