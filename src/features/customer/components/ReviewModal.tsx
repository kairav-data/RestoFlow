'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, ThumbsDown, ThumbsUp, Utensils, X } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { cn } from '@/lib/utils';
import { api, ApiError } from '@/lib/api';
import { SUGGESTION_TOPICS, type FeedbackInput } from '@/features/feedback/types';
import { useCustomer } from '../context/CustomerContext';
import { CustomerHeader } from './CustomerHeader';

const RATING_WORDS = ['Tap a star', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

const Card: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
    <div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
    {children}
  </section>
);

export const ReviewModal: React.FC = () => {
  const { restaurant, menuItems, orders, guest, selectedTable, setActiveScreen } = useCustomer();
  // Review the meal that was just paid for; fall back to the newest order.
  const reviewOrder = orders.find((o) => o.paymentStatus === 'paid') ?? orders[0] ?? null;

  // Dishes the guest ordered are pre-listed; they can add any other dish they tried.
  const orderedDishes = useMemo(() => {
    const seen = new Map<string, string>();
    reviewOrder?.items.forEach((it) => seen.set(it.menuItemId, it.name));
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [reviewOrder]);

  const [overall, setOverall] = useState(0);
  const [aspects, setAspects] = useState({ service: 0, ambience: 0, value: 0 });
  const [dishList, setDishList] = useState(orderedDishes);
  const [dishRatings, setDishRatings] = useState<Record<string, number>>({});
  const [dishNotes, setDishNotes] = useState<Record<string, string>>({});
  const [topics, setTopics] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const addableDishes = menuItems.filter((m) => !dishList.some((d) => d.id === m.id));

  const submit = async () => {
    if (!guest || sending) return;
    if (!reviewOrder) {
      setError('Place an order first, then you can review it.');
      return;
    }
    if (overall === 0) {
      setError('Please rate your overall experience.');
      return;
    }
    if (recommend === null) {
      setError('Let us know if you would recommend us.');
      return;
    }
    const input: FeedbackInput = {
      overallRating: overall,
      serviceRating: aspects.service || overall,
      ambienceRating: aspects.ambience || overall,
      valueRating: aspects.value || overall,
      dishRatings: dishList
        .filter((d) => dishRatings[d.id])
        .map((d) => ({
          dishId: d.id,
          dishName: d.name,
          rating: dishRatings[d.id],
          note: dishNotes[d.id]?.trim() || undefined,
        })),
      suggestionTopics: topics as FeedbackInput['suggestionTopics'],
      suggestion,
      wouldRecommend: recommend,
    };
    setSending(true);
    setError('');
    try {
      await api(`/api/r/${restaurant.slug}/feedback`, {
        method: 'POST',
        body: {
          orderId: reviewOrder.id,
          overall: input.overallRating,
          service: input.serviceRating,
          ambience: input.ambienceRating,
          value: input.valueRating,
          wouldRecommend: input.wouldRecommend,
          topics: input.suggestionTopics,
          suggestion: input.suggestion || undefined,
          dishRatings: input.dishRatings.map((d) => ({ menuItemId: d.dishId, rating: d.rating, note: d.note })),
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We could not save your feedback. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pb-28">
        <CustomerHeader title="Thank you" showBack onBack={() => setActiveScreen('home')} />
        <main className="mx-auto max-w-md px-4 py-10">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" strokeWidth={1.5} />
            <h2 className="text-2xl font-semibold text-slate-900">Feedback received</h2>
            <p className="text-sm text-slate-600">
              Thanks {guest?.name.split(' ')[0]}. Your ratings and suggestions go straight to the {restaurant.name} team.
            </p>
            <button
              onClick={() => setActiveScreen('home')}
              className="w-full rounded-lg bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-400"
            >
              Back to {restaurant.name}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-900">
      <CustomerHeader title="Rate your visit" showBack onBack={() => setActiveScreen('home')} />

      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            {restaurant.name} · Table {selectedTable}
          </p>
          <h2 className="text-2xl font-semibold">How was your experience?</h2>
          <StarRating value={overall} onChange={setOverall} size="lg" label="Overall experience" className="justify-center" />
          <p className="text-sm font-medium text-slate-600" aria-live="polite">
            {RATING_WORDS[overall]}
          </p>
        </section>

        <Card title="Rate the food" hint="Score each dish you tried. Skip any you did not.">
          {dishList.length === 0 && <p className="text-sm text-slate-500">Add the dishes you had below.</p>}
          <ul className="divide-y divide-slate-100">
            {dishList.map((d) => (
              <li key={d.id} className="space-y-2 py-3 first:pt-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                    <Utensils className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{d.name}</span>
                  </span>
                  {!orderedDishes.some((o) => o.id === d.id) && (
                    <button
                      onClick={() => setDishList((l) => l.filter((x) => x.id !== d.id))}
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                      aria-label={`Remove ${d.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <StarRating
                  value={dishRatings[d.id] ?? 0}
                  onChange={(v) => setDishRatings((r) => ({ ...r, [d.id]: v }))}
                  size="md"
                  label={`Rating for ${d.name}`}
                />
                {dishRatings[d.id] ? (
                  <input
                    value={dishNotes[d.id] ?? ''}
                    maxLength={200}
                    onChange={(e) => setDishNotes((n) => ({ ...n, [d.id]: e.target.value }))}
                    placeholder="Anything to add? (optional)"
                    aria-label={`Note about ${d.name}`}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-amber-500 focus:bg-white focus:outline-none"
                  />
                ) : null}
              </li>
            ))}
          </ul>
          {addableDishes.length > 0 && (
            <select
              aria-label="Add a dish you tried"
              value=""
              onChange={(e) => {
                const dish = menuItems.find((m) => m.id === e.target.value);
                if (dish) setDishList((l) => [...l, { id: dish.id, name: dish.name }]);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
            >
              <option value="">Add another dish you tried…</option>
              {addableDishes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
        </Card>

        <Card title={`Rate ${restaurant.name}`}>
          <div className="divide-y divide-slate-100">
            {(
              [
                ['service', 'Service & staff'],
                ['ambience', 'Ambience & cleanliness'],
                ['value', 'Value for money'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-sm text-slate-700">{label}</span>
                <StarRating
                  value={aspects[key]}
                  onChange={(v) => setAspects((a) => ({ ...a, [key]: v }))}
                  size="sm"
                  label={label}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Suggestions for the restaurant" hint="What should we keep doing, or change?">
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_TOPICS.map((t) => {
              const on = topics.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTopics((cur) => (on ? cur.filter((x) => x !== t) : [...cur, t]))}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                    on ? 'border-amber-500 bg-amber-100 font-medium text-amber-900' : 'border-slate-300 bg-white text-slate-700',
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <textarea
            rows={4}
            maxLength={1000}
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            aria-label="Your suggestion"
            placeholder="Tell us what you would love to see: a dish, a change in service, anything."
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </Card>

        <Card title={`Would you recommend ${restaurant.name}?`}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: true, label: 'Yes', icon: ThumbsUp },
              { value: false, label: 'Not yet', icon: ThumbsDown },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                aria-pressed={recommend === value}
                onClick={() => setRecommend(value)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors',
                  recommend === value ? 'border-amber-500 bg-amber-100 text-amber-900' : 'border-slate-300 bg-white text-slate-700',
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </Card>

        {error && (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.25rem)] z-30 mx-auto max-w-md px-4">
        <button
          onClick={submit}
          className="w-full rounded-lg bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-elevated transition-colors hover:bg-slate-800"
        >
          Submit feedback
        </button>
      </div>
    </div>
  );
};
