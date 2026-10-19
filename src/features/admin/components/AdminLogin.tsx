'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { signInAsAdmin } from '../services/adminAuth';

const schema = z.object({
  email: z.string().trim().email('Enter your admin email'),
  password: z.string().min(1, 'Enter your password'),
});
type FormValues = z.infer<typeof schema>;

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none';

export const AdminLogin: React.FC<{ onSignedIn: () => void }> = ({ onSignedIn }) => {
  const [formError, setFormError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setFormError('');
    const result = await signInAsAdmin(values.email, values.password);
    if (!result.ok) return setFormError(result.error);
    onSignedIn();
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 px-4 py-6">
      <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
        <BrandLogo size="lg" className="mb-8" />
        <h1 className="text-3xl font-semibold text-slate-900">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Onboard and manage the restaurants on RestoFlow.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                className={inputClass}
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="admin-password"
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
    </main>
  );
};
