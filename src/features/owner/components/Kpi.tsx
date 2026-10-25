import React from 'react';

/** A headline number with a label and an optional line of context underneath. */
export const Kpi: React.FC<{ label: string; value: string; children?: React.ReactNode }> = ({ label, value, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5">
    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-2 font-display text-3xl font-semibold text-slate-900">{value}</p>
    <div className="mt-2 min-h-[1rem]">{children}</div>
  </div>
);
