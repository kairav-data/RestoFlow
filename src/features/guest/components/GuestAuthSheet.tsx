'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck, Smartphone, X } from 'lucide-react';
import { RestaurantBrand } from '@/features/restaurants/components/RestaurantBrand';
import { useCustomer } from '@/features/customer/context/CustomerContext';
import { ApiError } from '@/lib/api';
import { maskPhone, requestOtp, verifyOtp } from '../services/guestService';

type Step = 'phone' | 'otp';

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none';

/** Bottom sheet that signs a guest in with a mobile number and an SMS code. New guests are asked for their name once. */
export const GuestAuthSheet: React.FC = () => {
  const { restaurant, selectedTable, isAuthOpen, closeAuth, completeLogin } = useCustomer();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [normalized, setNormalized] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [needsName, setNeedsName] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthOpen) return;
    setStep('phone');
    setCode('');
    setName('');
    setNeedsName(false);
    setError('');
    setDevCode('');
  }, [isAuthOpen]);

  useEffect(() => {
    if (!isAuthOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAuth();
    window.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLElement>('input')?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [isAuthOpen, step, needsName, closeAuth]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  if (!isAuthOpen) return null;

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await requestOtp(phone);
      setNormalized(res.phone);
      setDevCode(res.devCode ?? '');
      setStep('otp');
      setResendIn(30);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We could not send the code. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      completeLogin(await verifyOtp(normalized, code, needsName ? name.trim() : undefined));
    } catch (err) {
      if (err instanceof ApiError && err.message === 'NAME_REQUIRED') {
        setNeedsName(true);
      } else {
        setError(err instanceof ApiError ? err.message : 'We could not verify the code. Try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-obsidian-950/60 sm:items-center" onClick={closeAuth}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-slate-50 p-6 pb-8 sm:rounded-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {step === 'otp' && (
              <button
                onClick={() => {
                  setStep('phone');
                  setError('');
                  setNeedsName(false);
                }}
                className="-ml-1.5 rounded-full p-2 text-slate-600 hover:bg-slate-200"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <RestaurantBrand name={restaurant.name} logo={restaurant.logo} subtitle={`Table ${selectedTable}`} size="sm" />
          </div>
          <button onClick={closeAuth} className="rounded-full p-2 text-slate-500 hover:bg-slate-200" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 id="auth-title" className="text-2xl font-semibold text-slate-900">
          {step === 'phone' ? 'Sign in with your mobile' : needsName ? 'One last thing' : 'Enter the 6-digit code'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {step === 'phone'
            ? 'We will text you a code so the kitchen knows who to serve.'
            : needsName
              ? 'Welcome! Tell us your name so we can greet you.'
              : `Sent to ${maskPhone(normalized)}.`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={sendCode} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="guest-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
                Mobile number
              </label>
              <div className="relative">
                <Smartphone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="guest-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm text-rose-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || phone.replace(/\D/g, '').length < 8}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Send code
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="guest-otp" className="mb-1.5 block text-sm font-medium text-slate-700">
                Verification code
              </label>
              <input
                id="guest-otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="------"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em]`}
              />
            </div>
            {needsName && (
              <div>
                <label htmlFor="guest-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Your name
                </label>
                <input
                  id="guest-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            {devCode && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Development mode: SMS is not configured, so the code is <span className="font-mono font-semibold">{devCode}</span>.
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-rose-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || code.length !== 6 || (needsName && name.trim().length < 2)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {needsName ? 'Continue' : 'Verify and continue'}
            </button>
            <button
              type="button"
              disabled={resendIn > 0 || busy}
              onClick={() => sendCode()}
              className="w-full text-center text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
            </button>
          </form>
        )}

        <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          Your number is shared only with {restaurant.name} and is never sold.
        </p>
      </div>
    </div>
  );
};
