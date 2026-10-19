'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, MessageSquareText, ThumbsUp, TrendingDown, TrendingUp } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { useRestaurant } from '@/features/restaurants/context/RestaurantContext';
import { api } from '@/lib/api';

interface FeedbackData {
  summary: {
    count: number;
    overall: number | null;
    service: number | null;
    ambience: number | null;
    value: number | null;
    recommendPercent: number | null;
  };
  dishes: { name: string; rating: number; count: number }[];
  reviews: {
    id: string;
    customerName: string;
    overall: number;
    wouldRecommend: boolean;
    topics: string[];
    suggestion: string | null;
    createdAt: string;
  }[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const FeedbackInsightsView: React.FC = () => {
  const restaurant = useRestaurant();
  const [data, setData] = useState<FeedbackData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<FeedbackData>('/api/portal/feedback')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load feedback.'));
  }, []);

  if (error) return <p role="alert" className="p-6 text-sm text-rose-600">{error}</p>;
  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center p-12" aria-busy="true">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-label="Loading" />
      </div>
    );
  }

  const { summary, dishes, reviews } = data;
  const best = dishes.slice(0, 3);
  const needsWork = [...dishes].reverse().filter((d) => d.rating < 4).slice(0, 3);
  const written = reviews.filter((r) => r.suggestion);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Guest feedback</h2>
        <p className="mt-1 text-sm text-slate-500">
          Ratings, dish scores and suggestions from {restaurant.name} guests after their meal.
        </p>
      </div>

      {summary.count === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <MessageSquareText className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">No feedback yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            After a guest orders and pays, they are invited to rate their visit. Reviews appear here with dish-level scores.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Overall rating</p>
              <p className="mt-2 font-display text-4xl font-semibold text-slate-900">{summary.overall?.toFixed(1)}</p>
              <StarRating value={summary.overall ?? 0} size="sm" label="Overall rating" className="mt-2" />
              <p className="mt-2 text-xs text-slate-500">{summary.count} reviews</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Would recommend</p>
              <p className="mt-2 font-display text-4xl font-semibold text-slate-900">{summary.recommendPercent}%</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" /> of guests
              </p>
            </div>
            {[
              { label: 'Service', value: summary.service },
              { label: 'Value for money', value: summary.value },
            ].map((a) => (
              <div key={a.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{a.label}</p>
                <p className="mt-2 font-display text-4xl font-semibold text-slate-900">{a.value?.toFixed(1)}</p>
                <StarRating value={a.value ?? 0} size="sm" label={a.label} className="mt-2" />
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" /> Best rated dishes
              </h3>
              {best.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No dish ratings yet.</p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {best.map((d) => (
                    <li key={d.name} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="font-medium text-slate-800">{d.name}</span>
                      <span className="flex items-center gap-2 text-slate-500">
                        <StarRating value={d.rating} size="sm" label={d.name} />
                        {d.rating.toFixed(1)} ({d.count})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <TrendingDown className="h-4 w-4 text-rose-600" aria-hidden="true" /> Dishes to review
              </h3>
              {needsWork.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No dish is scoring below 4 stars.</p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {needsWork.map((d) => (
                    <li key={d.name} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="font-medium text-slate-800">{d.name}</span>
                      <span className="text-slate-500">
                        {d.rating.toFixed(1)} ({d.count})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-base font-semibold text-slate-900">Suggestions from guests</h3>
            {written.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Guests have not left written suggestions yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {written.map((f) => (
                  <li key={f.id} className="rounded-lg bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">
                        {f.customerName} · {f.overall}★
                      </span>
                      <span>{formatDate(f.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-800">{f.suggestion}</p>
                    {f.topics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {f.topics.map((t) => (
                          <span key={t} className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-600">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};
