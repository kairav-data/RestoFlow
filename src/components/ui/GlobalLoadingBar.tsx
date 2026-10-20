'use client';

import React, { useEffect, useState } from 'react';
import { subscribeBusy } from '@/lib/busy';

const SHOW_AFTER_MS = 120;

/** Thin animated bar at the top of the screen while any request is running, so every click gives visible feedback. */
export const GlobalLoadingBar: React.FC = () => {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const unsubscribe = subscribeBusy((count) => {
      window.clearTimeout(timer);
      if (count === 0) setBusy(false);
      // A short delay avoids a flicker for requests that finish instantly.
      else timer = window.setTimeout(() => setBusy(true), SHOW_AFTER_MS);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  if (!busy) return null;
  return (
    <div role="progressbar" aria-label="Loading" aria-busy="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-amber-100">
      <div className="rf-loading-bar h-full w-1/3 rounded-full bg-amber-500" />
    </div>
  );
};
