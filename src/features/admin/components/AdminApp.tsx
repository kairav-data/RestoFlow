'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, ExternalLink, KeyRound, LogOut, Plus, Store, Trash2 } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { RestaurantBrand } from '@/features/restaurants/components/RestaurantBrand';
import { ApiError } from '@/lib/api';
import { signOutAdmin } from '../services/adminAuth';
import { closeRestaurant, listRestaurants, resetOwnerPassword, type AdminRestaurant } from '../services/adminApi';
import { OnboardingForm } from './OnboardingForm';
import { AiSettingsPanel } from './AiSettingsPanel';

type View = { name: 'list' } | { name: 'ai' } | { name: 'onboard' } | { name: 'created'; restaurant: AdminRestaurant; password: string; reset?: boolean };

const CopyButton: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked: the value is visible to copy by hand */
        }
      }}
      className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
    </button>
  );
};

const CreatedPanel: React.FC<{ restaurant: AdminRestaurant; password: string; reset?: boolean; onDone: () => void }> = ({
  restaurant,
  password,
  reset,
  onDone,
}) => {
  const portalUrl = `${typeof window === 'undefined' ? '' : window.location.origin}/portal/${restaurant.slug}`;
  const rows = [
    { label: 'Portal link', value: portalUrl },
    { label: 'Restaurant code', value: restaurant.slug },
    { label: 'Owner email', value: restaurant.ownerEmail },
    { label: 'Temporary password', value: password },
  ];
  return (
    <div className="mx-auto max-w-xl py-8">
      <RestaurantBrand name={restaurant.name} logo={restaurant.logo} subtitle={restaurant.location} size="lg" />
      <h1 className="mt-6 text-2xl font-semibold text-slate-900">{reset ? `New password for ${restaurant.name}` : `${restaurant.name} is onboarded`}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Share these sign-in details with {restaurant.ownerName}. The password is shown only now; you can issue a new
        one later from the restaurant list.
      </p>
      <dl className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">{row.label}</dt>
              <dd className="mt-0.5 break-all font-mono text-sm text-slate-900">{row.value}</dd>
            </div>
            <CopyButton value={row.value} label={row.label.toLowerCase()} />
          </div>
        ))}
      </dl>
      <div className="mt-6 flex gap-3">
        <Link
          href={`/portal/${restaurant.slug}`}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Open portal <ExternalLink className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400"
        >
          Back to restaurants
        </button>
      </div>
    </div>
  );
};

export const AdminApp: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const [view, setView] = useState<View>({ name: 'list' });
  const [restaurants, setRestaurants] = useState<AdminRestaurant[] | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setRestaurants(await listRestaurants());
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load restaurants.');
      if (err instanceof ApiError && err.status === 401) onSignOut();
    }
  }, [onSignOut]);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const resetPassword = async (r: AdminRestaurant) => {
    try {
      const { password } = await resetOwnerPassword(r.slug);
      setView({ name: 'created', restaurant: r, password, reset: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset the password.');
    }
  };

  const remove = async (r: AdminRestaurant) => {
    if (!window.confirm(`Close ${r.name}? Guests and staff lose access immediately. Its data is kept.`)) return;
    try {
      await closeRestaurant(r.slug);
      setNotice(`${r.name} was closed.`);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not close the restaurant.');
    }
  };

  const active = (restaurants ?? []).filter((r) => r.status !== 'closed');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <span className="rounded-md bg-slate-900 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-white">
              Admin
            </span>
          </div>
          <nav aria-label="Admin sections" className="flex items-center gap-1 text-sm font-medium">
            {([['list', 'Restaurants'], ['ai', 'AI settings']] as const).map(([name, label]) => (
              <button
                key={name}
                type="button"
                onClick={() => setView(name === 'ai' ? { name: 'ai' } : { name: 'list' })}
                aria-current={(name === 'ai' ? view.name === 'ai' : view.name !== 'ai') ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 transition-colors ${
                  (name === 'ai' ? view.name === 'ai' : view.name !== 'ai')
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={async () => {
              await signOutAdmin();
              onSignOut();
            }}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {view.name === 'ai' && <AiSettingsPanel />}

        {view.name === 'created' && (
          <CreatedPanel
            restaurant={view.restaurant}
            password={view.password}
            reset={view.reset}
            onDone={() => {
              refresh();
              setView({ name: 'list' });
            }}
          />
        )}

        {view.name === 'onboard' && (
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Onboard a restaurant</h1>
            <p className="mt-1 text-sm text-slate-600">
              Add the restaurant&apos;s details and create the owner account. The owner takes over from there.
            </p>
            <div className="mt-6">
              <OnboardingForm
                onCancel={() => setView({ name: 'list' })}
                onCreated={(restaurant, password) => setView({ name: 'created', restaurant, password })}
              />
            </div>
          </div>
        )}

        {view.name === 'list' && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Restaurants</h1>
                <p className="mt-1 text-sm text-slate-600">
                  {restaurants === null ? 'Loading…' : `${active.length} active on the platform.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotice('');
                  setView({ name: 'onboard' });
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                <Plus className="h-4 w-4" /> Onboard restaurant
              </button>
            </div>

            {notice && (
              <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {notice}
              </p>
            )}
            {error && (
              <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            {restaurants !== null && active.length === 0 && (
              <div className="mt-6 flex items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white p-6">
                <Store className="h-8 w-8 shrink-0 text-slate-400" aria-hidden="true" />
                <p className="text-sm text-slate-600">
                  No restaurants yet. Use <strong>Onboard restaurant</strong> to add the first one.
                </p>
              </div>
            )}

            {active.length > 0 && (
              <ul className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {active.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                    <RestaurantBrand
                      name={r.name}
                      logo={r.logo}
                      subtitle={[r.cuisine, r.location].filter(Boolean).join(' · ')}
                      size="sm"
                      className="min-w-[14rem]"
                    />
                    <div className="min-w-0 text-sm text-slate-600">
                      <p className="font-mono text-xs text-slate-500">/portal/{r.slug}</p>
                      <p className="truncate">{r.ownerEmail}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => resetPassword(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        <KeyRound className="h-4 w-4" /> Reset password
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r)}
                        aria-label={`Close ${r.name}`}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/portal/${r.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
                      >
                        Portal <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
};
