'use client';

import React, { useState } from 'react';
import { Plus, Search, Star, Pencil, Leaf, Beef, ScanText, Salad } from 'lucide-react';
import { useOwner } from '../context/OwnerContext';
import { formatCurrency } from '@/lib/utils';
import type { MenuItem } from '@/types';
import { MenuScanModal } from '@/features/menu/components/MenuScanModal';
import { DishFormModal } from '@/features/menu/components/DishFormModal';

export const MenuManagementView: React.FC = () => {
  const { menuItems, toggleItemAvailability, setHalfPrice, deleteMenuItem } = useOwner();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScanOpen, setIsScanOpen] = useState<boolean>(false);
  /** null = closed, 'new' = add form, otherwise the dish being edited. */
  const [form, setForm] = useState<MenuItem | 'new' | null>(null);

  const filteredItems = menuItems.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen text-slate-800 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Menu Catalog &amp; Dish Availability
          </h2>
          <p className="text-xs text-slate-500">
            Modify pricing, descriptions, dietary tags, and live 86 / availability toggles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={() => setIsScanOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            <ScanText className="w-4 h-4" />
            <span>Scan menu with AI</span>
          </button>

          <button
            onClick={() => setForm('new')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {isScanOpen && <MenuScanModal onClose={() => setIsScanOpen(false)} />}

      {/* Dish Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Rating / Orders</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {item.description}
                        </p>
                        {item.nutrition && (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                            <Salad className="w-3 h-3" aria-hidden="true" />
                            Nutrition info added
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 capitalize">
                    {item.category.replace('-', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                        item.isVegetarian
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {item.isVegetarian ? <Leaf className="w-2.5 h-2.5" /> : <Beef className="w-2.5 h-2.5" />}
                      <span>{item.isVegetarian ? 'Veg' : 'Non-Veg'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-900">
                    <p className="font-black">
                      {item.halfPrice !== undefined && <span className="mr-1 text-[10px] font-semibold uppercase text-slate-500">Full</span>}
                      {formatCurrency(item.price)}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        id={`half-${item.id}`}
                        checked={item.halfPrice !== undefined}
                        onChange={(e) =>
                          setHalfPrice(item.id, e.target.checked ? Math.max(1, Math.round((item.price * 0.6) / 5) * 5) : undefined)
                        }
                        className="h-3.5 w-3.5 accent-[#C8202F]"
                      />
                      <label htmlFor={`half-${item.id}`} className="text-[10px] font-semibold uppercase text-slate-500">
                        Half plate
                      </label>
                      {item.halfPrice !== undefined && (
                        <input
                          type="number"
                          min={1}
                          max={item.price - 1}
                          value={item.halfPrice}
                          aria-label={`Half plate price for ${item.name}`}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (v > 0 && v < item.price) setHalfPrice(item.id, v);
                          }}
                          className="w-16 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-bold"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                      <span className="text-slate-400 font-normal">
                        ({item.reviewCount})
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600 line-through'
                      }`}
                    >
                      {item.isAvailable ? '● Available' : '○ Disabled (86)'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setForm(item)}
                      className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 font-bold text-[11px] hover:underline"
                    >
                      <Pencil className="w-3 h-3" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${item.name}?`)) void deleteMenuItem(item.id);
                      }}
                      className="ml-3 text-rose-600 hover:text-rose-800 font-bold text-[11px] hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {form && <DishFormModal dish={form === 'new' ? undefined : form} onClose={() => setForm(null)} />}
    </div>
  );
};
