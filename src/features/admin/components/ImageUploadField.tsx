'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { fileToResizedDataUrl } from '../services/imageUpload';

interface ImageUploadFieldProps {
  id: string;
  label: string;
  hint: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  /** Longest edge in px after downscaling. */
  maxSize: number;
  shape?: 'square' | 'wide';
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  id,
  label,
  hint,
  value,
  onChange,
  maxSize,
  shape = 'square',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setError('');
      onChange(await fileToResizedDataUrl(file, maxSize, shape === 'wide' ? 'image/jpeg' : 'image/png'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That image could not be used.');
    }
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 ${
            shape === 'wide' ? 'h-20 w-32' : 'h-20 w-20'
          }`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={`${label} preview`} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <input id={id} ref={inputRef} type="file" accept="image/*" onChange={onFile} className="sr-only" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400"
            >
              {value ? 'Replace' : 'Upload'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                aria-label={`Remove ${label.toLowerCase()}`}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-slate-500 transition-colors hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
          {error && (
            <p role="alert" className="mt-1 text-xs text-rose-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
