'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Camera, ImagePlus, Loader2, ScanText, Sparkles, X } from 'lucide-react';
import { useOwner } from '@/features/owner/context/OwnerContext';
import { useRestaurant } from '@/features/restaurants/context/RestaurantContext';
import { fileToResizedDataUrl } from '@/lib/image';
import { describeDishes, descriptionKey } from '../services/descriptionService';
import { cn } from '@/lib/utils';
import { ErrorPanel } from '@/components/ui/ErrorPanel';
import {
  draftToMenuItem,
  draftIssue,
  MAX_MENU_PHOTOS,
  scanMenuPhoto,
  toDrafts,
} from '../services/menuScanService';
import type { DraftDish, ExtractedDish } from '../types';

type Step = 'upload' | 'scanning' | 'review';

const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-none';

export const MenuScanModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const restaurant = useRestaurant();
  const { menuItems, categories, addNewMenuItems } = useOwner();
  const [step, setStep] = useState<Step>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ done: 0, total: 0 });
  const [saveError, setSaveError] = useState('');
  const [drafts, setDrafts] = useState<DraftDish[]>([]);
  const [describing, setDescribing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && step !== 'scanning' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, step]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const images = Array.from(list).filter((f) => f.type.startsWith('image/'));
    setError(images.length < list.length ? 'Only image files can be scanned.' : '');
    setFiles((prev) => [...prev, ...images].slice(0, MAX_MENU_PHOTOS));
  };

  const runScan = async () => {
    setStep('scanning');
    setError('');
    setPhotoErrors([]);
    setSaveError('');
    setProgress(0);
    const batches: ExtractedDish[][] = [];
    const failures: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        batches.push(await scanMenuPhoto(files[i], categories));
      } catch (err) {
        failures.push(`Photo ${i + 1}: ${err instanceof Error ? err.message : 'Menu scanning failed.'}`);
      }
      setProgress(i + 1);
    }
    const result = toDrafts(batches, categories, menuItems.map((m) => m.name));
    setPhotoErrors(failures);
    if (result.length === 0) {
      if (failures.length === 0) setError('No new dishes were found. Try a clearer, well-lit photo of the menu.');
      setStep('upload');
      return;
    }
    setDrafts(result);
    setStep('review');
    fillDescriptions(result);
  };

  /** Dishes whose menu shows no description get one written by the AI from the dish name. */
  const fillDescriptions = async (list: DraftDish[]) => {
    const missing = list.filter((d) => !d.description.trim());
    if (missing.length === 0) return;
    setDescribing(true);
    try {
      for (let i = 0; i < missing.length; i += 40) {
        const chunk = missing.slice(i, i + 40);
        const found = await describeDishes(
          chunk.map((d) => ({
            name: d.name,
            category: categories.find((c) => c.id === d.categoryId)?.name,
            isVegetarian: d.isVegetarian,
          })),
        );
        setDrafts((prev) =>
          prev.map((d) => {
            const text = chunk.some((c) => c.key === d.key) ? found.get(descriptionKey(d.name)) : undefined;
            // Never overwrite something the owner typed while the AI was working.
            return text && !d.description.trim() ? { ...d, description: text } : d;
          }),
        );
      }
    } catch {
      // Descriptions are optional: the owner can still write them or use "Write with AI" per dish.
    } finally {
      setDescribing(false);
    }
  };

  const update = (key: string, patch: Partial<DraftDish>) =>
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));

  const attachPhoto = async (key: string, file?: File) => {
    if (!file) return;
    try {
      update(key, { image: await fileToResizedDataUrl(file, 480, 'image/jpeg') });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That photo could not be used.');
    }
  };

  const selected = useMemo(() => drafts.filter((d) => d.include), [drafts]);
  const issues = selected.map(draftIssue);
  const blocked = issues.filter(Boolean).length;
  const missingPrice = issues.filter((i) => i === 'price').length;
  const badHalf = issues.filter((i) => i === 'half').length;
  const isDraftReady = (d: DraftDish) => draftIssue(d) === null;
  const blockedMessage = [
    missingPrice > 0 ? `${missingPrice} selected dish${missingPrice > 1 ? 'es have' : ' has'} no price (the scan could not read it - type it in)` : '',
    badHalf > 0 ? `${badHalf} half plate price${badHalf > 1 ? 's' : ''} must be lower than the full plate price` : '',
    selected.length > 0 && blocked > missingPrice + badHalf ? 'a dish name is empty' : '',
  ]
    .filter(Boolean)
    .join('; ');

  const confirm = async () => {
    setSaving(true);
    setSaveError('');
    setSaveProgress({ done: 0, total: selected.length });
    const result = await addNewMenuItems(selected.map(draftToMenuItem), (done, total) => setSaveProgress({ done, total }));
    setSaving(false);
    if (result.ok) {
      onClose();
      return;
    }
    // Dishes saved before the failure leave the list, so trying again never creates duplicates.
    const added = result.added ?? 0;
    if (added > 0) {
      const saved = new Set(selected.slice(0, added).map((d) => d.key));
      setDrafts((prev) => prev.filter((d) => !saved.has(d.key)));
    }
    setSaveError(
      added > 0
        ? `${added} dishes were added to your menu. The rest could not be saved: ${result.error ?? 'unknown error'}. Press the button again to retry the remaining dishes.`
        : result.error ?? 'The dishes could not be saved.',
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-title"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-xl bg-white shadow-elevated sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="scan-title" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" /> Build your menu from a photo
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {step === 'review'
                ? `${drafts.length} dishes found. Check the details, then add them to your menu.${describing ? ' Writing descriptions…' : ''}`
                : 'Upload photos of your printed menu. AI reads the dishes, prices and categories.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={step === 'scanning'}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {step !== 'review' && (
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              aria-label="Choose menu photos"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={step === 'scanning' || files.length >= MAX_MENU_PHOTOS}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addFiles(e.dataTransfer.files);
              }}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition-colors hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Camera className="h-8 w-8 text-slate-400" aria-hidden="true" />
              <span className="text-sm font-semibold text-slate-900">Take or choose menu photos</span>
              <span className="text-xs text-slate-500">
                Up to {MAX_MENU_PHOTOS} photos, one per menu page. Good light and a flat page read best.
              </span>
            </button>

            {previews.length > 0 && (
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {previews.map((src, i) => (
                  <li key={src} className="relative overflow-hidden rounded-lg border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Menu page ${i + 1}`} className="h-32 w-full object-cover" />
                    {step === 'upload' && (
                      <button
                        type="button"
                        aria-label={`Remove menu page ${i + 1}`}
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-slate-700 hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {step === 'scanning' && (
              <p role="status" className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Reading photo {Math.min(progress + 1, files.length)} of {files.length}…
              </p>
            )}
            {error && <ErrorPanel className="mt-4" title="Something went wrong" messages={[error]} />}
            <ErrorPanel className="mt-4" title="These photos could not be read" messages={photoErrors} />
          </div>
        )}

        {step === 'review' && (
          <div className="flex-1 overflow-y-auto">
            {(error || photoErrors.length > 0) && (
              <div className="sticky top-0 z-10 space-y-3 bg-white p-5 pb-3">
                {error && <ErrorPanel title="Something went wrong" messages={[error]} />}
                <ErrorPanel title="Some photos could not be read, so their dishes are missing" messages={photoErrors} />
              </div>
            )}
            <ul className="divide-y divide-slate-200">
              {drafts.map((d) => (
                <li key={d.key} className={cn('grid gap-3 px-5 py-4 sm:grid-cols-[auto_72px_1fr]', !d.include && 'opacity-50')}>
                  <input
                    type="checkbox"
                    checked={d.include}
                    onChange={(e) => update(d.key, { include: e.target.checked })}
                    aria-label={`Include ${d.name || 'dish'}`}
                    className="mt-2 h-4 w-4 accent-[#C8202F]"
                  />
                  <label className="relative flex h-[72px] w-[72px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-amber-400">
                    {d.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex flex-col items-center gap-1 text-[10px] font-medium">
                        <ImagePlus className="h-5 w-5" aria-hidden="true" /> Photo
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      aria-label={`Add photo for ${d.name || 'dish'}`}
                      onChange={(e) => {
                        attachPhoto(d.key, e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-[1fr_110px_160px]">
                    <input
                      value={d.name}
                      onChange={(e) => update(d.key, { name: e.target.value })}
                      aria-label="Dish name"
                      className={cn(fieldClass, 'font-medium')}
                    />
                    <input
                      value={d.price}
                      onChange={(e) => update(d.key, { price: e.target.value.replace(/[^\d.]/g, '') })}
                      inputMode="decimal"
                      placeholder={`Price (${restaurant.currency})`}
                      aria-label={`Price in ${restaurant.currency}`}
                      aria-invalid={d.include && d.price.trim() === ''}
                      className={cn(fieldClass, d.include && d.price.trim() === '' && 'border-rose-400')}
                    />
                    <select
                      value={d.categoryId}
                      onChange={(e) => update(d.key, { categoryId: e.target.value })}
                      aria-label="Category"
                      className={fieldClass}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={d.description}
                      onChange={(e) => update(d.key, { description: e.target.value })}
                      placeholder={describing ? 'Writing description…' : 'Description'}
                      aria-label="Description"
                      className={cn(fieldClass, 'sm:col-span-3 text-slate-600')}
                    />
                    <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
                      <button
                        type="button"
                        onClick={() => update(d.key, { isVegetarian: !d.isVegetarian })}
                        aria-pressed={d.isVegetarian}
                        className={cn(
                          'rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors',
                          d.isVegetarian
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-rose-300 bg-rose-50 text-rose-700',
                        )}
                      >
                        {d.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
                      </button>
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                        <input
                          type="checkbox"
                          checked={d.halfPrice !== ''}
                          onChange={(e) =>
                            update(d.key, {
                              halfPrice:
                                e.target.checked && Number(d.price) > 1
                                  ? String(Math.min(Number(d.price) - 1, Math.max(1, Math.round((Number(d.price) * 0.6) / 5) * 5)))
                                  : '',
                            })
                          }
                          className="h-4 w-4 accent-[#C8202F]"
                        />
                        Half plate
                      </label>
                      {d.halfPrice !== '' && (
                        <input
                          value={d.halfPrice}
                          onChange={(e) => update(d.key, { halfPrice: e.target.value.replace(/[^\d.]/g, '') })}
                          inputMode="decimal"
                          aria-label={`Half plate price in ${restaurant.currency}`}
                          aria-invalid={!isDraftReady(d)}
                          className={cn(fieldClass, 'w-24 py-1', !isDraftReady(d) && d.include && 'border-rose-400')}
                        />
                      )}
                      {d.confidence !== 'high' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                          {d.confidence === 'low' ? 'Hard to read, please check' : 'Please double-check'}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 'review' && saveError && (
          <div className="border-t border-slate-200 bg-white px-5 py-3">
            <ErrorPanel title="The dishes could not be added" messages={[saveError]} />
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
          {step === 'review' ? (
            <>
              <p className="text-sm text-slate-600">
                {blocked > 0 ? `${blockedMessage}.` : `${selected.length} selected`}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  Scan again
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={selected.length === 0 || blocked > 0 || saving}
                  aria-busy={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {saving
                    ? `Adding ${saveProgress.done} of ${saveProgress.total}…`
                    : `Add ${selected.length} dish${selected.length === 1 ? '' : 'es'} to menu`}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500">Photos are sent to an AI service to read the text. RestoFlow does not keep them.</p>
              <button
                type="button"
                onClick={runScan}
                disabled={files.length === 0 || step === 'scanning'}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {step === 'scanning' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ScanText className="h-4 w-4" aria-hidden="true" />
                )}
                {step === 'scanning' ? 'Reading menu…' : 'Read menu'}
              </button>
            </>
          )}
        </footer>
      </motion.div>
    </div>
  );
};
