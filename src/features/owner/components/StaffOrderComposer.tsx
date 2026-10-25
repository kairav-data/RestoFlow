'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Package, Plus, Search, UtensilsCrossed, X } from 'lucide-react';
import { AsyncButton } from '@/components/ui/AsyncButton';
import { api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import type { MenuItem } from '@/types';
import { useOwner } from '../context/OwnerContext';
import { useTicketDraft, type Portion } from '../hooks/useTicketDraft';

type TableOption = { id: string; name: string; capacity: number };
type Mode = 'dine-in' | 'parcel';

const PortionStepper: React.FC<{
  label?: string;
  price: number;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  dishName: string;
}> = ({ label, price, quantity, onAdd, onRemove, dishName }) =>
  quantity === 0 ? (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`Add ${dishName}${label ? `, ${label.toLowerCase()} plate` : ''}`}
      className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-amber-400 hover:text-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
    >
      <Plus className="h-3 w-3" aria-hidden="true" />
      {label ? `${label} ${formatCurrency(price)}` : 'Add'}
    </button>
  ) : (
    <div className="flex items-center gap-1 rounded-lg bg-slate-900 px-1 py-0.5 text-white">
      <button type="button" onClick={onRemove} aria-label={`One less ${dishName}`} className="rounded p-1 hover:bg-slate-700">
        <Minus className="h-3 w-3" aria-hidden="true" />
      </button>
      <span className="min-w-[2.5rem] text-center text-[11px] font-bold" aria-live="polite">
        {label ? `${label[0]} ×${quantity}` : `×${quantity}`}
      </span>
      <button type="button" onClick={onAdd} aria-label={`One more ${dishName}`} className="rounded p-1 hover:bg-slate-700">
        <Plus className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );

/** Slide-over where staff take an order for a guest without a phone, or ring up a parcel at the counter. */
export const StaffOrderComposer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { menuItems, categories, placeStaffOrder } = useOwner();
  const ticket = useTicketDraft();
  const [mode, setMode] = useState<Mode>('dine-in');
  const [tables, setTables] = useState<TableOption[] | null>(null);
  const [tableId, setTableId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [notes, setNotes] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [error, setError] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<{ tables: TableOption[] }>('/api/portal/tables')
      .then((d) => setTables(d.tables))
      .catch(() => setTables([]));
  }, []);

  useEffect(() => {
    searchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const dishes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menuItems.filter(
      (d) => d.isAvailable && (category === 'all' || d.category === category) && (!q || d.name.toLowerCase().includes(q)),
    );
  }, [menuItems, query, category]);
  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const submit = async () => {
    if (ticket.count === 0) return setError('Add at least one dish.');
    if (mode === 'dine-in' && !tableId) return setError('Choose the table, or switch to Parcel.');
    setError('');
    const result = await placeStaffOrder({
      tableId: mode === 'dine-in' ? tableId : undefined,
      isParcel: mode === 'parcel',
      guestName: guestName.trim() || undefined,
      notes: notes.trim() || undefined,
      items: ticket.lines.map((l) => ({ menuItemId: l.dish.id, quantity: l.quantity, portion: l.portion })),
    });
    if (result.ok) onClose();
    else setError(result.error ?? 'Could not place the order.');
  };

  const steppers = (dish: MenuItem) => {
    const portions: { portion: Portion; label?: string; price: number }[] = dish.halfPrice
      ? [
          { portion: 'half', label: 'Half', price: dish.halfPrice },
          { portion: 'full', label: 'Full', price: dish.price },
        ]
      : [{ portion: 'full', price: dish.price }];
    return portions.map((p) => (
      <PortionStepper
        key={p.portion}
        label={p.label}
        price={p.price}
        dishName={dish.name}
        quantity={ticket.quantityOf(dish.id, p.portion)}
        onAdd={() => ticket.add(dish, p.portion)}
        onRemove={() => ticket.remove(dish, p.portion)}
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-order-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-5xl flex-col bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="staff-order-title" className="text-lg font-semibold text-slate-900">
              New order
            </h2>
            <p className="text-xs text-slate-500">For guests ordering at the counter or with staff. It goes straight to the kitchen.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-slate-400 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Menu */}
          <section aria-label="Menu" className="flex min-h-0 flex-1 flex-col border-slate-200 lg:border-r">
            <div className="space-y-3 border-b border-slate-100 px-6 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search dishes…"
                  aria-label="Search dishes"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filter by category">
                {[{ id: 'all', name: 'All' }, ...categories].map((c) => (
                  <button
                    key={c.id}
                    aria-pressed={category === c.id}
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      'whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold transition-colors',
                      category === c.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto px-6">
              {dishes.length === 0 && (
                <li className="py-12 text-center text-sm text-slate-500">
                  {menuItems.length === 0 ? 'Your menu is empty. Add dishes in Menu Management first.' : 'No available dishes match.'}
                </li>
              )}
              {dishes.map((dish) => (
                <li key={dish.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn('h-2.5 w-2.5 shrink-0 rounded-sm border', dish.isVegetarian ? 'border-emerald-600 bg-emerald-500' : 'border-rose-700 bg-rose-600')}
                      aria-label={dish.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{dish.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {categoryName.get(dish.category) ?? dish.category}
                        {!dish.halfPrice && ` · ${formatCurrency(dish.price)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">{steppers(dish)}</div>
                </li>
              ))}
            </ul>
          </section>

          {/* Ticket */}
          <section aria-label="Ticket" className="flex max-h-[55vh] w-full flex-col bg-slate-50 lg:max-h-none lg:w-[380px]">
            <div className="space-y-3 border-b border-slate-200 px-5 py-4">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1" role="radiogroup" aria-label="Order type">
                {(
                  [
                    { value: 'dine-in', label: 'Dine-in', Icon: UtensilsCrossed },
                    { value: 'parcel', label: 'Parcel', Icon: Package },
                  ] as const
                ).map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    role="radio"
                    aria-checked={mode === value}
                    onClick={() => setMode(value)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors',
                      mode === value ? 'bg-white text-slate-900 shadow-subtle' : 'text-slate-600 hover:text-slate-900',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              {mode === 'dine-in' && (
                <label className="block text-xs font-medium text-slate-700">
                  Table
                  <select
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    disabled={!tables}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none disabled:opacity-60"
                  >
                    <option value="">{tables ? (tables.length ? 'Choose a table' : 'No tables yet') : 'Loading tables…'}</option>
                    {tables?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} · {t.capacity} seats
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block text-xs font-medium text-slate-700">
                Guest name <span className="font-normal text-slate-400">(optional)</span>
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={60}
                  placeholder={mode === 'parcel' ? 'Name to call out at pickup' : 'e.g. Mr. Sharma'}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
              {ticket.lines.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">Add dishes from the menu.</p>
              ) : (
                <ul className="space-y-2">
                  {ticket.lines.map((l) => (
                    <li key={`${l.dish.id}:${l.portion}`} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate text-slate-800">
                        <span className="mr-1.5 font-bold text-amber-600">{l.quantity}×</span>
                        {l.dish.name}
                        {l.dish.halfPrice && <span className="text-slate-500"> ({l.portion === 'half' ? 'Half' : 'Full'})</span>}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => ticket.remove(l.dish, l.portion)}
                          aria-label={`One less ${l.dish.name}`}
                          className="rounded p-1 text-slate-500 hover:bg-slate-200"
                        >
                          <Minus className="h-3 w-3" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => ticket.add(l.dish, l.portion)}
                          aria-label={`One more ${l.dish.name}`}
                          className="rounded p-1 text-slate-500 hover:bg-slate-200"
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <label className="mt-4 block text-xs font-medium text-slate-700">
                Kitchen note <span className="font-normal text-slate-400">(optional)</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={300}
                  rows={2}
                  placeholder="Less spicy, no onion…"
                  className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                />
              </label>
            </div>

            <footer className="space-y-3 border-t border-slate-200 bg-white px-5 py-4">
              {error && (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {error}
                </p>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">
                  Subtotal · {ticket.count} item{ticket.count === 1 ? '' : 's'}
                </span>
                <span className="text-base font-bold text-slate-900">{formatCurrency(ticket.subtotal)}</span>
              </div>
              <p className="text-[11px] text-slate-400">Taxes and service charge are added on the bill.</p>
              <AsyncButton
                onClick={submit}
                disabled={ticket.count === 0}
                className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {mode === 'parcel' ? 'Send parcel to kitchen' : 'Send to kitchen'}
              </AsyncButton>
            </footer>
          </section>
        </div>
      </aside>
    </div>
  );
};
