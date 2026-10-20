'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, ScanLine, X } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '../data/content';

/** Sticky top bar: turns into a frosted white bar once the page scrolls, and a full-screen menu on phones. */
export const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className={cn('fixed inset-x-0 top-0 z-40 transition-all duration-300', scrolled || open ? 'border-b border-slate-200 bg-white/90 backdrop-blur-md' : 'bg-transparent')}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="RestoFlow home" onClick={() => setOpen(false)}>
          <BrandLogo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-amber-600">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/portal" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-amber-600">
            Restaurant portal
          </Link>
          <Link href="/scan" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-card">
            <ScanLine className="h-4 w-4" aria-hidden="true" /> Scan table QR
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-800 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-white px-6 py-6 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-slate-100 py-4 font-display text-2xl font-semibold text-slate-900">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <Link href="/scan" className="flex items-center justify-center gap-2 rounded-full bg-amber-500 py-3.5 text-sm font-semibold text-white">
              <ScanLine className="h-4 w-4" aria-hidden="true" /> Scan table QR
            </Link>
            <Link href="/portal" className="rounded-full border border-slate-300 py-3.5 text-center text-sm font-semibold text-slate-800">
              Restaurant portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
