import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { CONTACT, NAV_LINKS } from '../data/content';

/** Closing call to action and the footer. */
export const LandingFooter: React.FC = () => (
  <>
    <section className="bg-amber-500">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-14 sm:px-6 lg:px-8">
        <div>
          <h2 className="font-display text-4xl font-semibold text-white sm:text-5xl">Ready to serve smarter?</h2>
          <p className="mt-2 text-lg text-amber-50">Get your restaurant live on RestoFlow this week.</p>
        </div>
        <a href="#contact" className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-amber-600 transition-all hover:shadow-elevated">
          Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </a>
      </div>
    </section>

    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <BrandLogo theme="dark" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">One flow for the whole table: scan, order, track, pay and review. Built in Mumbai.</p>
        </div>

        <nav aria-label="Footer">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Explore</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}><a href={l.href} className="transition-colors hover:text-white">{l.label}</a></li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">RestoFlow</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/scan" className="transition-colors hover:text-white">Scan a table QR</Link></li>
            <li><Link href="/portal" className="transition-colors hover:text-white">Restaurant portal</Link></li>
            <li><Link href="/admin" className="transition-colors hover:text-white">Platform admin</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-white"><Mail className="h-4 w-4 text-amber-400" aria-hidden="true" /> {CONTACT.email}</a></li>
            <li><a href={CONTACT.phoneHref} className="inline-flex items-center gap-2 transition-colors hover:text-white"><Phone className="h-4 w-4 text-amber-400" aria-hidden="true" /> {CONTACT.phone}</a></li>
            <li className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400" aria-hidden="true" /> {CONTACT.city}, {CONTACT.country}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">© {new Date().getFullYear()} RestoFlow. All rights reserved.</p>
      </div>
    </footer>
  </>
);
