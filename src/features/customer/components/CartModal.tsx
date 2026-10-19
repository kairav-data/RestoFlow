'use client';

import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { formatCurrency } from '@/lib/utils';
import { CustomerHeader } from './CustomerHeader';

export const CartModal: React.FC = () => {
  const {
    cart,
    updateCartItemQty,
    clearCart,
    cartTotal,
    submitOrder,
    isPlacingOrder,
    orderError,
    setActiveScreen,
    selectedTable,
  } = useCustomer();

  const [cookingInstructions, setCookingInstructions] = useState<string>('');

  const subtotal = cartTotal;
  const taxes = Math.round(subtotal * 0.05); // 5% GST
  const serviceCharge = Math.round(subtotal * 0.05); // 5% Service Charge
  const grandTotal = subtotal + taxes + serviceCharge;

  const handleSendOrder = () => submitOrder(cookingInstructions);

  return (
    <div className="min-h-screen bg-white text-slate-850 pb-28">
      <CustomerHeader title="Your Cart & Order" showBack={true} />

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-20 space-y-4 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-card">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Your cart is empty</h3>
              <p className="text-xs text-slate-500">
                Explore our digital menu or try our AI recommendation wizard!
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('menu')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Browse Digital Menu
            </button>
          </div>
        ) : (
          <>
            {/* Table Identification Card */}
            <div className="flex items-center justify-between p-3.5 bg-obsidian-850 text-white rounded-2xl shadow-subtle">
              <div>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Dining Session
                </p>
                <p className="text-sm font-bold">Table {selectedTable} • Dine-In</p>
              </div>
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Selected Dishes ({cart.length})
              </h3>

              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-start gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                          {item.name}
                        </h4>
                        <span className="font-extrabold text-slate-900 text-xs ml-2">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Pairings if selected */}
                      {item.selectedPairings && item.selectedPairings.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-0.5 space-y-0.5">
                          {item.selectedPairings.map((p) => (
                            <p key={p.id}>+ {p.name} ({formatCurrency(p.price)})</p>
                          ))}
                        </div>
                      )}

                      {/* Stepper */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-slate-100 rounded-lg px-2 py-0.5">
                          <button
                            onClick={() => updateCartItemQty(item.id, -1)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQty(item.id, 1)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions & Allergies */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-2">
              <label className="text-xs font-bold text-slate-900">
                Cooking instructions or allergies (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Less oil, extra spicy, no nuts..."
                value={cookingInstructions}
                onChange={(e) => setCookingInstructions(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
              />
            </div>

            {/* Bill Summary */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
                Bill Summary
              </h3>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Item Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes (estimate)</span>
                <span>{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service charge (estimate)</span>
                <span>{formatCurrency(serviceCharge)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-100">
                <span>To Pay</span>
                <span className="text-amber-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {orderError && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {orderError}
              </p>
            )}

            {/* Send to Kitchen CTA */}
            <button
              disabled={isPlacingOrder}
              onClick={handleSendOrder}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-75 text-white font-bold text-sm rounded-2xl shadow-elevated active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isPlacingOrder ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Order to Kitchen</span>
                  <span>•</span>
                  <span>{formatCurrency(grandTotal)}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </>
        )}
      </main>
    </div>
  );
};
