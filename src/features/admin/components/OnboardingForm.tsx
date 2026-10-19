'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw } from 'lucide-react';
import { generatePassword } from '@/lib/crypto';
import { ApiError } from '@/lib/api';
import { CURRENCIES, onboardingSchema, type OnboardingInput, type OnboardingValues } from '../types';
import { createRestaurant, slugify, type AdminRestaurant } from '../services/adminApi';
import { ImageUploadField } from './ImageUploadField';

interface OnboardingFormProps {
  onCancel: () => void;
  onCreated: (restaurant: AdminRestaurant, password: string) => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none';

const Field: React.FC<{
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ id, label, error, hint, className, children }) => (
  <div className={className}>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    {error && (
      <p role="alert" className="mt-1 text-xs text-rose-600">
        {error}
      </p>
    )}
  </div>
);

const Section: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <fieldset className="grid gap-6 border-t border-slate-200 py-8 lg:grid-cols-[240px_1fr]">
    <legend className="sr-only">{title}</legend>
    <div aria-hidden="true">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </fieldset>
);

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onCancel, onCreated }) => {
  const [logo, setLogo] = useState<string>();
  const [cover, setCover] = useState<string>();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<OnboardingInput, unknown, OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      currency: 'INR',
      tableCount: 10,
      operatingHours: '11:00 AM - 11:00 PM',
      password: '',
    },
  });

  const name = watch('name');
  useEffect(() => {
    if (!dirtyFields.slug) setValue('slug', slugify(name ?? ''));
  }, [name, dirtyFields.slug, setValue]);

  const onSubmit = async (values: OnboardingValues) => {
    setSubmitError('');
    try {
      const created = await createRestaurant(values, { logo, cover });
      onCreated(
        {
          id: created.id,
          slug: created.slug,
          name: created.name,
          cuisine: values.cuisine,
          location: values.location,
          logo,
          status: 'active',
          createdAt: new Date().toISOString(),
          ownerName: values.ownerName,
          ownerEmail: values.ownerEmail,
        },
        values.password,
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(/email/i.test(err.message) ? 'ownerEmail' : 'slug', { message: err.message });
      } else {
        setSubmitError(err instanceof ApiError ? err.message : 'We could not save this restaurant. Try again.');
      }
    }
  };

  const msg = (k: keyof OnboardingInput) => errors[k]?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Section title="Restaurant" description="How the restaurant appears to guests and on printed QR cards.">
        <Field id="name" label="Restaurant name" error={msg('name')}>
          <input id="name" className={inputClass} placeholder="SpiceHaven" {...register('name')} />
        </Field>
        <Field
          id="slug"
          label="Restaurant code"
          error={msg('slug')}
          hint="Used in the portal and QR links: /portal/your-code"
        >
          <input id="slug" className={`${inputClass} font-mono`} autoCapitalize="none" {...register('slug')} />
        </Field>
        <Field id="cuisine" label="Cuisine" error={msg('cuisine')}>
          <input id="cuisine" className={inputClass} placeholder="North Indian" {...register('cuisine')} />
        </Field>
        <Field id="tagline" label="Tagline (optional)" error={msg('tagline')}>
          <input id="tagline" className={inputClass} placeholder="Slow-cooked, wood-fired" {...register('tagline')} />
        </Field>
        <Field id="description" label="Description (optional)" error={msg('description')} className="sm:col-span-2">
          <textarea id="description" rows={3} className={inputClass} {...register('description')} />
        </Field>
        <ImageUploadField
          id="logo"
          label="Logo"
          hint="Square PNG or JPG, shown on the menu and QR cards."
          value={logo}
          onChange={setLogo}
          maxSize={256}
        />
        <ImageUploadField
          id="cover"
          label="Cover photo (optional)"
          hint="Wide food or venue photo for the portal sign-in."
          value={cover}
          onChange={setCover}
          maxSize={1200}
          shape="wide"
        />
      </Section>

      <Section title="Location & contact" description="Where guests find the restaurant.">
        <Field id="address" label="Street address" error={msg('address')} className="sm:col-span-2">
          <input id="address" className={inputClass} autoComplete="street-address" {...register('address')} />
        </Field>
        <Field id="location" label="City / area" error={msg('location')}>
          <input id="location" className={inputClass} placeholder="Bandra West, Mumbai" {...register('location')} />
        </Field>
        <Field id="phone" label="Phone" error={msg('phone')}>
          <input id="phone" type="tel" className={inputClass} placeholder="+91 98765 43210" {...register('phone')} />
        </Field>
        <Field id="operatingHours" label="Operating hours" error={msg('operatingHours')}>
          <input id="operatingHours" className={inputClass} {...register('operatingHours')} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field id="currency" label="Currency" error={msg('currency')}>
            <select id="currency" className={inputClass} {...register('currency')}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field id="tableCount" label="Tables" error={msg('tableCount')}>
            <input id="tableCount" type="number" min={1} max={200} className={inputClass} {...register('tableCount')} />
          </Field>
        </div>
      </Section>

      <Section
        title="Owner account"
        description="The owner signs in at /portal with these details and manages the restaurant themselves."
      >
        <Field id="ownerName" label="Owner name" error={msg('ownerName')}>
          <input id="ownerName" className={inputClass} autoComplete="off" {...register('ownerName')} />
        </Field>
        <Field id="ownerEmail" label="Owner email" error={msg('ownerEmail')}>
          <input id="ownerEmail" type="email" className={inputClass} autoComplete="off" {...register('ownerEmail')} />
        </Field>
        <Field
          id="password"
          label="Temporary password"
          error={msg('password')}
          hint="Shown once after onboarding. Share it with the owner securely."
          className="sm:col-span-2"
        >
          <div className="flex gap-2">
            <input
              id="password"
              type="text"
              className={`${inputClass} font-mono`}
              autoComplete="off"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setValue('password', generatePassword(), { shouldValidate: true })}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400"
            >
              <RefreshCw className="h-4 w-4" /> Generate
            </button>
          </div>
        </Field>
      </Section>

      {submitError && (
        <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {submitError}
        </p>
      )}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-400 disabled:opacity-60"
        >
          {isSubmitting ? 'Onboarding…' : 'Onboard restaurant'}
        </button>
      </div>
    </form>
  );
};
