'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Sparkles, X } from 'lucide-react';
import type { MenuItem } from '@/types';
import { fileToResizedDataUrl } from '@/lib/image';
import { useOwner } from '@/features/owner/context/OwnerContext';
import { describeDishes, descriptionKey } from '../services/descriptionService';
import {
  blankDish,
  dishToForm,
  formToChanges,
  formToNewDish,
  suggestHalfPrice,
  validateDish,
  type DishFormErrors,
  type DishFormValues,
} from '../services/dishForm';
import { SPICE_LEVELS } from '../types';
import { NutritionFields } from './NutritionFields';
import { ErrorPanel } from '@/components/ui/ErrorPanel';

interface DishFormModalProps {
  /** Pass a dish to edit it; leave empty to add a new one. */
  dish?: MenuItem;
  onClose: () => void;
}

const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:border-amber-400 focus:outline-none';

/** Add or edit one dish: details, prices (with optional half plate), photo and optional nutrition facts. */
export const DishFormModal: React.FC<DishFormModalProps> = ({ dish, onClose }) => {
  const { categories, addNewMenuItem, updateMenuItem } = useOwner();
  const [values, setValues] = useState<DishFormValues>(() => (dish ? dishToForm(dish) : blankDish(categories[0]?.id ?? '')));
  const [errors, setErrors] = useState<DishFormErrors>({});
  const [busy, setBusy] = useState(false);
  const [writing, setWriting] = useState(false);
  const [note, setNote] = useState('');
  const [saveError, setSaveError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(dish);

  const set = <K extends keyof DishFormValues>(key: K, value: DishFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const writeDescription = async (): Promise<string> => {
    const category = categories.find((c) => c.id === values.categoryId)?.name;
    const result = await describeDishes([{ name: values.name.trim(), category, isVegetarian: values.isVegetarian }]);
    return result.get(descriptionKey(values.name)) ?? [...result.values()][0] ?? '';
  };

  const onWriteWithAi = async () => {
    if (!values.name.trim()) return;
    setWriting(true);
    setNote('');
    try {
      const text = await writeDescription();
      if (text) set('description', text);
      else setNote('The AI did not return a description.');
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'Writing the description failed.');
    } finally {
      setWriting(false);
    }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setNote('');
      set('image', await fileToResizedDataUrl(file, 800, 'image/jpeg'));
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'That photo could not be used.');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateDish(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    setSaveError('');
    let next = values;
    // New dish without a description: let the AI write one from the name, as when scanning a menu.
    if (!isEdit && !values.description.trim()) {
      const text = await writeDescription().catch(() => '');
      next = { ...values, description: text || 'Freshly prepared specialty dish.' };
    }
    const result = dish ? await updateMenuItem(dish.id, formToChanges(next, dish)) : await addNewMenuItem(formToNewDish(next));
    setBusy(false);
    if (result.ok) onClose();
    else setSaveError(result.error ?? 'The dish could not be saved.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-form-title"
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 id="dish-form-title" className="text-base font-bold text-slate-900">
            {isEdit ? `Edit ${dish?.name}` : 'Add New Dish'}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1 text-slate-400 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
              {values.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values.image} alt="Dish preview" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} className="sr-only" aria-label="Dish photo" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:border-slate-400"
              >
                {values.image ? 'Replace photo' : 'Upload photo'}
              </button>
              <p className="mt-1 text-slate-500">Optional. A neutral picture is used if you skip this.</p>
            </div>
          </div>

          <div>
            <label htmlFor="dish-name" className="mb-1 block font-bold text-slate-700">Dish name</label>
            <input
              id="dish-name"
              value={values.name}
              maxLength={80}
              placeholder="e.g. Malai Kofta"
              onChange={(e) => set('name', e.target.value)}
              aria-invalid={Boolean(errors.name)}
              className={inputClass}
            />
            {errors.name && <p role="alert" className="mt-1 text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="dish-desc" className="font-bold text-slate-700">Description</label>
              <button
                type="button"
                onClick={onWriteWithAi}
                disabled={!values.name.trim() || writing}
                className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-800 disabled:opacity-40"
              >
                {writing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Write with AI
              </button>
            </div>
            <textarea
              id="dish-desc"
              rows={2}
              maxLength={240}
              placeholder={isEdit ? '' : 'Leave empty and AI writes it from the dish name.'}
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              className={inputClass}
            />
            {note && <p role="alert" className="mt-1 text-rose-600">{note}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dish-price" className="mb-1 block font-bold text-slate-700">
                {values.halfOn ? 'Full plate price' : 'Price'}
              </label>
              <input
                id="dish-price"
                inputMode="decimal"
                value={values.price}
                onChange={(e) => set('price', e.target.value.replace(/[^\d.]/g, ''))}
                aria-invalid={Boolean(errors.price)}
                className={inputClass}
              />
              {errors.price && <p role="alert" className="mt-1 text-rose-600">{errors.price}</p>}
            </div>
            <div>
              <label htmlFor="dish-category" className="mb-1 block font-bold text-slate-700">Category</label>
              <select id="dish-category" value={values.categoryId} onChange={(e) => set('categoryId', e.target.value)} className={inputClass}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <label className="flex cursor-pointer items-center justify-between gap-3 font-bold text-slate-700">
              <span>
                Also sell a half plate
                <span className="block font-normal text-slate-500">Guests choose half or full when ordering.</span>
              </span>
              <input
                type="checkbox"
                checked={values.halfOn}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    halfOn: e.target.checked,
                    halfPrice: e.target.checked && !prev.halfPrice ? suggestHalfPrice(Number(prev.price)) : prev.halfPrice,
                  }))
                }
                className="h-4 w-4 accent-[#C8202F]"
              />
            </label>
            {values.halfOn && (
              <div className="mt-3">
                <label htmlFor="dish-half" className="mb-1 block font-bold text-slate-700">Half plate price</label>
                <input
                  id="dish-half"
                  inputMode="decimal"
                  value={values.halfPrice}
                  onChange={(e) => set('halfPrice', e.target.value.replace(/[^\d.]/g, ''))}
                  aria-invalid={Boolean(errors.halfPrice)}
                  className={inputClass}
                />
                {errors.halfPrice && <p role="alert" className="mt-1 text-rose-600">{errors.halfPrice}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <fieldset>
              <legend className="mb-1 font-bold text-slate-700">Type</legend>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2 font-semibold">
                  <input type="radio" name="dish-diet" checked={values.isVegetarian} onChange={() => set('isVegetarian', true)} className="accent-emerald-600" />
                  Veg
                </label>
                <label className="flex cursor-pointer items-center gap-2 font-semibold">
                  <input type="radio" name="dish-diet" checked={!values.isVegetarian} onChange={() => set('isVegetarian', false)} className="accent-rose-600" />
                  Non-veg
                </label>
              </div>
            </fieldset>
            <div>
              <label htmlFor="dish-spice" className="mb-1 block font-bold text-slate-700">Spice level</label>
              <select
                id="dish-spice"
                value={values.spiceLevel}
                onChange={(e) => set('spiceLevel', e.target.value as DishFormValues['spiceLevel'])}
                className={`${inputClass} capitalize`}
              >
                {SPICE_LEVELS.map((level) => (
                  <option key={level} value={level}>{level.replace('-', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {isEdit && (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 font-bold text-slate-700">
              <span>
                Available to order
                <span className="block font-normal text-slate-500">Switch off when the kitchen runs out (86).</span>
              </span>
              <input type="checkbox" checked={values.isAvailable} onChange={(e) => set('isAvailable', e.target.checked)} className="h-4 w-4 accent-[#C8202F]" />
            </label>
          )}

          <details className="rounded-xl border border-slate-200 p-3" open={Boolean(dish?.nutrition)}>
            <summary className="cursor-pointer font-bold text-slate-700">
              Nutrition information <span className="font-normal text-slate-500">(optional, per full plate)</span>
            </summary>
            <div className="mt-3">
              <NutritionFields
                values={values}
                errors={errors}
                onNutrition={(key, v) => setValues((prev) => ({ ...prev, nutrition: { ...prev.nutrition, [key]: v } }))}
                onServingSize={(v) => set('servingSize', v)}
              />
            </div>
          </details>
        </div>

        {saveError && (
          <div className="px-6 pb-3">
            <ErrorPanel title="This dish could not be saved" messages={[saveError]} />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? 'Save changes' : 'Save & publish dish'}
          </button>
        </div>
      </form>
    </div>
  );
};
