'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { getAiKeyStatus, removeAiKey, saveAiKey, type AiKeyStatus } from '../services/adminAuth';

const SOURCE_LABEL = {
  admin: 'Saved by an administrator',
  environment: 'Set in the server environment (GOOGLE_API_KEY)',
} as const;

export const AiSettingsPanel: React.FC = () => {
  const [status, setStatus] = useState<AiKeyStatus>();
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus(await getAiKeyStatus());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load AI settings.');
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const run = async (action: () => Promise<AiKeyStatus>, done: boolean) => {
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      setStatus(await action());
      setApiKey('');
      setSaved(done);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">AI settings</h1>
      <p className="mt-1 text-sm text-slate-600">
        AI features run on a free, open-source model through Ollama by default. A Google (Gemini) key is only used when the server sets AI_PROVIDER=google.
      </p>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="key-heading">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="key-heading" className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <KeyRound className="h-4 w-4 text-amber-600" aria-hidden="true" /> Google API key
            </h2>
            {!status && !error && <p className="mt-2 text-sm text-slate-500">Loading…</p>}
            {status?.source === 'none' && (
              <p className="mt-2 text-sm text-slate-600">No key configured. AI features are switched off.</p>
            )}
            {status && status.source !== 'none' && (
              <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span className="font-mono">•••• {status.last4}</span>
                <span className="text-slate-400">·</span>
                <span>{SOURCE_LABEL[status.source]}</span>
              </p>
            )}
          </div>
          {status?.source === 'admin' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm('Remove the saved key? AI features stop working unless a server key is set.')) {
                  run(removeAiKey, false);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          )}
        </div>

        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (apiKey.trim()) run(() => saveAiKey(apiKey.trim()), true);
          }}
        >
          <label htmlFor="google-key" className="mb-1.5 block text-sm font-medium text-slate-700">
            {status?.source === 'admin' ? 'Replace key' : 'Add key'}
          </label>
          <div className="flex gap-2">
            <input
              id="google-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza…"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !apiKey.trim()}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Verify &amp; save
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-sm text-rose-600">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="mt-2 text-sm text-emerald-700">
              Key verified with Google and saved.
            </p>
          )}
        </form>

        <p className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          The key is checked with Google, then encrypted and stored on the server only. It is never sent back to the
          browser, so only the last four characters are ever shown. Create a Gemini key in Google AI Studio.
        </p>
      </section>
    </div>
  );
};
