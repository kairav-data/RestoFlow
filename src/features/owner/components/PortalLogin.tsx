'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import type { Restaurant } from '@/features/restaurants/types';
import { RestaurantBrand } from '@/features/restaurants/components/RestaurantBrand';
import { RestoFlowMark } from '@/components/ui/BrandLogo';
import { signInToPortal } from '../services/ownerAuth';

const schema = z.object({
  email: z.string().trim().email('Enter your work email'),
  password: z.string().min(1, 'Enter your password'),
});
type FormValues = z.infer<typeof schema>;

export const PortalLogin: React.FC<{ restaurant: Restaurant; onSignedIn: () => void }> = ({
  restaurant,
  onSignedIn,
}) => {
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const result = await signInToPortal(restaurant.slug, values.email, values.password);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    onSignedIn();
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none';

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <section className="flex flex-col px-6 py-6 sm:px-10">
        <Link href="/portal" className="inline-flex w-fit items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Not your restaurant?
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <RestaurantBrand name={restaurant.name} logo={restaurant.logo} subtitle={`${restaurant.cuisine} · ${restaurant.location}`} size="lg" />
          <h1 className="mt-8 text-3xl font-semibold text-slate-900">Sign in to {restaurant.name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            This portal is dedicated to {restaurant.name}. Only its owners and managers can sign in here.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@restaurant.com"
                  className={inputClass}
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>}
            </div>

            {formError && (
              <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              Sign in
            </button>
          </form>

        </div>

        <p className="flex items-center gap-2 text-xs text-slate-400">
          <RestoFlowMark size={16} /> Powered by RestoFlow
        </p>
      </section>

      <section className="relative hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={restaurant.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-obsidian-950/10 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="font-display text-3xl font-semibold leading-tight">{restaurant.heroSubtitle}</p>
          <p className="mt-2 text-sm text-slate-200">{restaurant.heroDescription}</p>
        </div>
      </section>
    </main>
  );
};
