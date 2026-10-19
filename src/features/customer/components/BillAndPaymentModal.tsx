'use client';

import React, { useMemo, useState } from 'react';
import { Banknote, CheckCircle2, CreditCard, Loader2, QrCode, Star, ArrowRight, Users } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { formatCurrency } from '@/lib/utils';
import { ApiError } from '@/lib/api';
import { CustomerHeader } from './CustomerHeader';

type Method = 'upi' | 'card' | 'cash';

const METHODS: { id: Method; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: 'upi', label: 'UPI', hint: 'Google Pay, PhonePe, Paytm', icon: <QrCode className="h-4 w-4" /> },
  { id: 'card', label: 'Card', hint: 'Visa, Mastercard, RuPay', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'cash', label: 'Cash', hint: 'Pay the server at your table', icon: <Banknote className="h-4 w-4" /> },
];

/**
 * The guest's bill across every order at this restaurant. Payment is settled at the table: the guest chooses
 * how they will pay, and the restaurant staff confirm it in their portal.
 */
export const BillAndPaymentModal: React.FC = () => {
  const { orders, unpaidOrders, setActiveScreen, selectedTable, restaurant, requestPayment } = useCustomer();
  const [method, setMethod] = useState<Method>('upi');
  const [splitBetween, setSplitBetween] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const bill = useMemo(() => {
    const lines = new Map<string, { name: string; price: number; quantity: number }>();
    let subtotal = 0;
    let taxes = 0;
    let service = 0;
    for (const o of unpaidOrders) {
      subtotal += o.subtotal;
      taxes += o.taxes;
      service += o.serviceCharge;
      for (const it of o.items) {
        const prev = lines.get(it.name);
        lines.set(it.name, { name: it.name, price: it.price, quantity: (prev?.quantity ?? 0) + it.quantity });
      }
    }
    return { lines: [...lines.values()], subtotal, taxes, service, total: subtotal + taxes + service };
  }, [unpaidOrders]);

  const requested = unpaidOrders.length > 0 && unpaidOrders.every((o) => o.paymentStatus === 'pending');
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const allPaid = unpaidOrders.length === 0 && paidOrders.length > 0;
  const share = Math.ceil(bill.total / splitBetween);

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      await requestPayment(method);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We could not send your payment request. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (allPaid) {
    const paidTotal = paidOrders.reduce((s, o) => s + o.total, 0);
    return (
      <div className="min-h-screen bg-white pb-28 text-slate-850">
        <CustomerHeader title="Payment receipt" showBack onBack={() => setActiveScreen('orders')} />
        <main className="mx-auto max-w-md space-y-5 px-4 py-4">
          <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Payment confirmed</span>
              <h2 className="text-2xl font-black text-slate-900">{formatCurrency(paidTotal)}</h2>
              <p className="text-xs text-slate-500">
                {restaurant.name} · Table {selectedTable}
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <p className="text-xs text-slate-600">How was your meal? A quick review helps the team improve.</p>
              <button
                onClick={() => setActiveScreen('review')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-white transition-colors hover:bg-amber-600"
              >
                <Star className="h-4 w-4" />
                <span>Rate &amp; review {restaurant.name}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (unpaidOrders.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-28 text-slate-850">
        <CustomerHeader title="Your bill" showBack onBack={() => setActiveScreen('orders')} />
        <p className="mx-auto max-w-md px-4 py-16 text-center text-sm text-slate-500">You have no unpaid orders.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 text-slate-850">
      <CustomerHeader title={`Bill for table ${selectedTable}`} showBack onBack={() => setActiveScreen('orders')} />

      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        <section className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900">Ordered items</span>
            <span className="text-[11px] text-slate-500">
              {unpaidOrders.length} order{unpaidOrders.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {bill.lines.map((l) => (
              <div key={l.name} className="flex items-center justify-between py-2">
                <div>
                  <span className="mr-2 font-bold text-slate-900">{l.quantity}×</span>
                  <span className="text-slate-800">{l.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(l.price * l.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-slate-100 pt-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span>{formatCurrency(bill.taxes)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service charge</span>
              <span>{formatCurrency(bill.service)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-slate-900">
              <span>Total</span>
              <span className="text-amber-600">{formatCurrency(bill.total)}</span>
            </div>
          </div>
        </section>

        <section className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-subtle">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-semibold text-slate-700">
              <Users className="h-4 w-4 text-amber-600" aria-hidden="true" /> Splitting between
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setSplitBetween(n)}
                  aria-pressed={splitBetween === n}
                  className={`h-7 w-7 rounded-full text-xs font-bold ${
                    splitBetween === n ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          {splitBetween > 1 && (
            <p className="text-[11px] text-slate-500">
              Each person pays about <strong className="text-slate-900">{formatCurrency(share)}</strong>. Settle the shares with the server.
            </p>
          )}
        </section>

        {requested ? (
          <section role="status" className="space-y-1 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-amber-600" aria-hidden="true" />
            <p className="text-sm font-bold text-slate-900">Waiting for the restaurant to confirm</p>
            <p className="text-xs text-slate-600">
              A server is coming to your table for the {unpaidOrders[0].paymentMethod?.toUpperCase()} payment of {formatCurrency(bill.total)}. This
              page updates by itself.
            </p>
          </section>
        ) : (
          <>
            <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">How will you pay?</h3>
              <div className="space-y-2" role="radiogroup" aria-label="Payment method">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={method === m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                      method === m.id ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">{m.icon}</span>
                      <span>
                        <span className="block text-xs font-bold text-slate-900">{m.label}</span>
                        <span className="block text-[10px] text-slate-500">{m.hint}</span>
                      </span>
                    </span>
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        method === m.id ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                      }`}
                    >
                      {method === m.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">You pay at the table. The restaurant confirms once it has received the payment.</p>
            </section>

            {error && (
              <p role="alert" className="text-sm text-rose-600">
                {error}
              </p>
            )}
            <button
              disabled={busy}
              onClick={pay}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-sm font-bold text-white shadow-elevated transition-all hover:bg-amber-600 disabled:opacity-75"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <>Request bill • {formatCurrency(bill.total)}</>}
            </button>
          </>
        )}
      </main>
    </div>
  );
};
