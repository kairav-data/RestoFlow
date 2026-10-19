'use client';

import React from 'react';
import { NUTRITION_FIELDS, type DishFormErrors, type DishFormValues, type NutritionKey } from '../services/dishForm';

interface NutritionFieldsProps {
  values: DishFormValues;
  errors: DishFormErrors;
  onNutrition: (key: NutritionKey, value: string) => void;
  onServingSize: (value: string) => void;
}

const inputClass = 'w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:border-amber-400 focus:outline-none';

/** Optional nutrition facts for one dish. Leave everything empty to show no nutrition information to guests. */
export const NutritionFields: React.FC<NutritionFieldsProps> = ({ values, errors, onNutrition, onServingSize }) => (
  <div className="space-y-3">
    <div>
      <label htmlFor="nutrition-serving" className="mb-1 block font-bold text-slate-700">
        Serving size
      </label>
      <input
        id="nutrition-serving"
        value={values.servingSize}
        maxLength={40}
        placeholder="e.g. 1 plate, 250 g"
        onChange={(e) => onServingSize(e.target.value)}
        className={inputClass}
      />
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {NUTRITION_FIELDS.map(({ key, label, unit }) => (
        <div key={key}>
          <label htmlFor={`nutrition-${key}`} className="mb-1 block font-bold text-slate-700">
            {label} <span className="font-normal text-slate-400">({unit})</span>
          </label>
          <input
            id={`nutrition-${key}`}
            inputMode="decimal"
            value={values.nutrition[key]}
            onChange={(e) => onNutrition(key, e.target.value.replace(/[^\d.]/g, ''))}
            aria-invalid={Boolean(errors[key])}
            className={inputClass}
          />
          {errors[key] && (
            <p role="alert" className="mt-1 text-rose-600">
              {errors[key]}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
);
