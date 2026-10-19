import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { PortalFinder } from '@/features/owner/components/PortalFinder';

export const metadata: Metadata = { title: 'Restaurant portal' };

export default function PortalIndexPage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 px-4 py-6">
      <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <BrandLogo size="lg" className="mb-8" />
        <h1 className="text-3xl font-semibold text-slate-900">Find your restaurant portal</h1>
        <p className="mt-2 text-sm text-slate-600">
          Every restaurant has its own dedicated portal. Enter your restaurant code to continue to sign in.
        </p>
        <PortalFinder />
      </div>
    </main>
  );
}
