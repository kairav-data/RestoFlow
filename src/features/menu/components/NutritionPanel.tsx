import React from 'react';
import type { NutritionInfo } from '@/types';
import { NUTRITION_FIELDS } from '../services/dishForm';

/** Read-only nutrition facts shown to guests on a dish. Renders nothing when the restaurant added none. */
export const NutritionPanel: React.FC<{ nutrition?: NutritionInfo }> = ({ nutrition }) => {
  if (!nutrition) return null;
  const rows = NUTRITION_FIELDS.filter(({ key }) => nutrition[key] !== undefined);
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="nutrition-heading" className="space-y-2.5 pt-1">
      <div className="flex items-baseline justify-between">
        <h3 id="nutrition-heading" className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Nutrition
        </h3>
        <span className="text-[11px] text-slate-500">
          Per full plate{nutrition.servingSize ? ` (${nutrition.servingSize})` : ''}
        </span>
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {rows.map(({ key, label, unit }) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-slate-50/60 px-2 py-2.5 text-center">
            <dd className="text-sm font-extrabold text-slate-900">
              {nutrition[key]}
              <span className="ml-0.5 text-[10px] font-semibold text-slate-500">{unit}</span>
            </dd>
            <dt className="mt-0.5 text-[10px] font-medium text-slate-500">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
};
