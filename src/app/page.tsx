import Link from 'next/link';
import { ArrowRight, QrCode, ScanLine, Star, Store } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

const STEPS = [
  {
    icon: QrCode,
    title: 'Owner creates table QR codes',
    body: 'Name each table once. RestoFlow prints a QR tent card that opens that restaurant and that table.',
  },
  {
    icon: ScanLine,
    title: 'Guests scan and see the menu',
    body: 'No app to install. The restaurant menu opens instantly, with photos, filters and AI suggestions.',
  },
  {
    icon: Star,
    title: 'Feedback flows back',
    body: 'Guests sign in with a mobile number, order, then rate the meal, each dish and suggest improvements.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <BrandLogo />
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href="/scan" className="rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900">
            Scan a table QR
          </Link>
          <Link href="/admin" className="rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900">
            Admin
          </Link>
          <Link
            href="/portal"
            className="rounded-lg bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-800"
          >
            Restaurant portal
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
              <Store className="h-3.5 w-3.5" /> Built for restaurants
            </p>
            <h1 className="text-5xl font-semibold leading-[1.05] text-slate-900 sm:text-6xl">
              Every table.
              <br />
              <span className="text-amber-600">One flow.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              Each restaurant gets its own portal, table QR codes and a digital menu. Guests scan, browse and order,
              then tell you what they loved and what to improve.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-400"
              >
                Open your restaurant portal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400"
              >
                <ScanLine className="h-4 w-4" /> I am a guest, scan QR
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Live order</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">Table T12 · #24</p>
              <ul className="mt-4 divide-y divide-slate-100 text-sm text-slate-700">
                <li className="flex justify-between py-2"><span>2× Paneer Tikka</span><span>Preparing</span></li>
                <li className="flex justify-between py-2"><span>1× Dal Tadka (Half)</span><span>Preparing</span></li>
                <li className="flex justify-between py-2"><span>3× Garlic Naan</span><span>Ready</span></li>
              </ul>
              <p className="mt-4 text-xs text-slate-500">Guests order from their phone. Your kitchen sees it instantly.</p>
            </div>
            <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
                <QrCode className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Scan to open the menu</p>
                <p className="font-display text-base font-semibold text-slate-900">Table T12</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <div key={title}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step {i + 1}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        RestoFlow · Multi-restaurant dining platform
      </footer>
    </div>
  );
}
