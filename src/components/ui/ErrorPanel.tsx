'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorPanelProps {
  title: string;
  /** One line per problem. Nothing renders when empty. */
  messages: string[];
  className?: string;
}

/** A prominent error box that scrolls itself into view, so problems are never missed. */
export const ErrorPanel: React.FC<ErrorPanelProps> = ({ title, messages, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const signature = messages.join('|');

  useEffect(() => {
    if (signature) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [signature]);

  if (messages.length === 0) return null;
  return (
    <div ref={ref} role="alert" className={cn('rounded-lg border-2 border-rose-300 bg-rose-50 p-4 text-rose-900', className)}>
      <p className="flex items-center gap-2 text-sm font-bold">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
        {title}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
};
