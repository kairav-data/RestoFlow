'use client';

import React from 'react';
import { BookOpen, Check, QrCode, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { useRestaurant } from '@/features/restaurants/context/RestaurantContext';
import { useOwner, type OwnerNavSection } from '../context/OwnerContext';

interface Step {
  id: OwnerNavSection;
  icon: LucideIcon;
  title: string;
  body: string;
  action: string;
  done: boolean;
}

/** Shown in place of analytics for a newly onboarded restaurant, so no placeholder numbers are displayed. */
export const GettingStarted: React.FC = () => {
  const restaurant = useRestaurant();
  const { setActiveSection, menuItems, staff } = useOwner();
  const [tableCount, setTableCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    api<{ tables: unknown[] }>('/api/portal/tables').then((d) => setTableCount(d.tables.length)).catch(() => undefined);
  }, []);
  const steps: Step[] = [
    {
      id: 'menu',
      icon: BookOpen,
      title: 'Add your menu',
      body: 'Create your dishes with prices, photos and dietary tags. Guests see them the moment you save.',
      action: 'Open menu management',
      done: menuItems.length > 0,
    },
    {
      id: 'tables-qr',
      icon: QrCode,
      title: 'Print your table QR codes',
      body: `${tableCount ?? 'Your'} tables are ready. Rename them if needed, then print a QR card for each.`,
      action: 'Open tables & QR',
      done: false,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl p-6 lg:p-10">
      <p className="text-sm font-medium text-amber-700">Welcome, {staff.name.split(' ')[0]}</p>
      <h1 className="mt-1 text-3xl font-semibold text-slate-900">Set up {restaurant.name}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Your restaurant is live on RestoFlow. Orders, customer insights and analytics appear here once guests start
        ordering.
      </p>

      <ol className="mt-8 space-y-3">
        {steps.map((step, i) => (
          <li key={step.id} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                step.done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {step.done ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-900">
                {i + 1}. {step.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              <button
                type="button"
                onClick={() => setActiveSection(step.id)}
                className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                {step.action}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
