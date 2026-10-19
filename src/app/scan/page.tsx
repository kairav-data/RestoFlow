import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { QrScanner } from '@/features/qr/components/QrScanner';

export const metadata: Metadata = { title: 'Scan your table QR' };

export default function ScanPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <BrandLogo size="sm" />
      </div>
      <h1 className="mt-8 text-3xl font-semibold text-slate-900">Scan your table QR</h1>
      <p className="mb-6 mt-2 text-sm text-slate-600">
        Scan the code on your table to open that restaurant&apos;s menu. No app needed.
      </p>
      <QrScanner />
    </main>
  );
}
