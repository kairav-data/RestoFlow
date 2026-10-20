'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import { cn } from '@/lib/utils';
import { CONTACT } from '../data/content';
import { contactSchema, type ContactInput } from '../types';
import { sendEnquiry } from '../services/contactService';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

type FormValues = Omit<ContactInput, 'topic'> & { topic: ContactInput['topic'] };

const TOPICS: { value: ContactInput['topic']; label: string }[] = [
  { value: 'restaurant', label: 'I own a restaurant' },
  { value: 'guest', label: 'I am a guest' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Something else' },
];

const field = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:border-amber-500 focus:outline-none aria-[invalid=true]:border-rose-400';

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; href?: string }> = ({ icon, label, value, href }) => {
  const inner = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-subtle transition-colors group-hover:bg-amber-500 group-hover:text-white">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="block truncate text-lg font-semibold text-slate-900">{value}</span>
      </span>
    </>
  );
  const cls = 'group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-amber-200';
  return href ? <a href={href} className={cls}>{inner}</a> : <div className={cls}>{inner}</div>;
};

export const ContactSection: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(contactSchema) as never, defaultValues: { topic: 'restaurant' } });

  const onSubmit = async (values: FormValues) => {
    setError('');
    try {
      await sendEnquiry(values);
      setSent(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send your message. Please try again.');
    }
  };

  return (
    <section id="contact" className="scroll-mt-20 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Contact us" title={<>Let&apos;s get your restaurant <span className="italic text-amber-500">on RestoFlow</span></>} body="Tell us about your restaurant, or ask us anything. We reply within one working day." />
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="space-y-4">
            <InfoCard icon={<Mail className="h-5 w-5" aria-hidden="true" />} label="Email" value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
            <InfoCard icon={<Phone className="h-5 w-5" aria-hidden="true" />} label="Phone" value={CONTACT.phone} href={CONTACT.phoneHref} />
            <InfoCard icon={<MapPin className="h-5 w-5" aria-hidden="true" />} label="Based in" value={`${CONTACT.city}, ${CONTACT.country}`} />
            <InfoCard icon={<Clock className="h-5 w-5" aria-hidden="true" />} label="Reply time" value="Within one working day" />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
              {sent ? (
                <div role="status" className="py-12 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-3xl font-semibold text-slate-900">Message sent</h3>
                  <p className="mt-2 text-slate-600">Thank you. We will get back to you within one working day.</p>
                  <button onClick={() => setSent(false)} className="mt-6 text-sm font-semibold text-amber-600 hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium text-slate-700">Your name</label>
                    <input id="c-name" autoComplete="name" aria-invalid={Boolean(errors.name)} className={field} {...register('name')} />
                    {errors.name && <p role="alert" className="mt-1 text-sm text-rose-600">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                    <input id="c-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} className={field} {...register('email')} />
                    {errors.email && <p role="alert" className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-phone" className="mb-1.5 block text-sm font-medium text-slate-700">Phone <span className="font-normal text-slate-400">(optional)</span></label>
                    <input id="c-phone" type="tel" autoComplete="tel" className={field} {...register('phone')} />
                  </div>
                  <div>
                    <label htmlFor="c-topic" className="mb-1.5 block text-sm font-medium text-slate-700">I am reaching out as</label>
                    <select id="c-topic" className={field} {...register('topic')}>
                      {TOPICS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="c-message" className="mb-1.5 block text-sm font-medium text-slate-700">How can we help?</label>
                    <textarea id="c-message" rows={5} aria-invalid={Boolean(errors.message)} className={cn(field, 'resize-y')} placeholder="Tell us about your restaurant, how many tables you have, and what you would like to do." {...register('message')} />
                    {errors.message && <p role="alert" className="mt-1 text-sm text-rose-600">{errors.message.message}</p>}
                  </div>
                  {/* Honeypot: hidden from people, tempting to bots. */}
                  <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                    <label htmlFor="c-website">Website</label>
                    <input id="c-website" tabIndex={-1} autoComplete="off" {...register('website')} />
                  </div>
                  {error && <ErrorPanel className="sm:col-span-2" title="Your message was not sent" messages={[error]} />}
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-card disabled:opacity-75 sm:w-auto">
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
                      {isSubmitting ? 'Sending…' : 'Send message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
