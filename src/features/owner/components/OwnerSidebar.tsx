'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  BookOpen,
  QrCode,
  Users,
  MessageSquareText,
  FileSpreadsheet,
  ChevronDown,
  MapPin,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { RestoFlowMark } from '@/components/ui/BrandLogo';
import { RestaurantBrand } from '@/features/restaurants/components/RestaurantBrand';
import { useRestaurant } from '@/features/restaurants/context/RestaurantContext';
import { cn } from '@/lib/utils';
import { useOwner, OwnerNavSection } from '../context/OwnerContext';
import { signOutOfPortal } from '../services/ownerAuth';

interface NavItem {
  id: OwnerNavSection;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const OwnerSidebar: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const restaurant = useRestaurant();
  const { staff, activeSection, setActiveSection, selectedBranch, setSelectedBranch, orders } = useOwner();
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  const newOrders = orders.filter((o) => o.status === 'new').length;
  const nav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ReceiptText, badge: newOrders },
    { id: 'menu', label: 'Menu Management', icon: BookOpen },
    { id: 'tables-qr', label: 'Tables & QR', icon: QrCode },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics-feedback', label: 'Feedback & Reviews', icon: MessageSquareText },
    // Revenue reports are only for owners and managers; the server enforces the same rule.
    ...(staff.role === 'owner' || staff.role === 'manager'
      ? [{ id: 'reports' as const, label: 'Reports', icon: FileSpreadsheet }]
      : []),
  ];

  return (
    <aside className="sticky top-0 z-30 flex h-screen w-64 shrink-0 select-none flex-col justify-between border-r border-obsidian-750 bg-obsidian-850 text-slate-300">
      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="border-b border-white/5 p-5">
          <RestaurantBrand name={restaurant.name} logo={restaurant.logo} subtitle="Restaurant portal" theme="dark" />
        </div>

        <nav className="space-y-1 p-3" aria-label="Portal">
          {nav.map((item) => {
            const active = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className={cn('h-[18px] w-[18px]', active && 'text-amber-400')} strokeWidth={1.75} />
                  {item.label}
                </span>
                {item.badge ? (
                  <span
                    className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white"
                    aria-label={`${item.badge} new`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2 border-t border-white/5 p-3">
        <div className="relative">
          <button
            onClick={() => setIsBranchOpen((v) => !v)}
            aria-expanded={isBranchOpen}
            disabled={restaurant.branches.length < 2}
            className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2.5 text-xs font-medium text-white transition-colors enabled:hover:bg-white/10"
          >
            <span className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
              <span className="truncate">{selectedBranch}</span>
            </span>
            {restaurant.branches.length > 1 && <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
          </button>
          {isBranchOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-white/10 bg-obsidian-800 p-1 shadow-elevated">
              {restaurant.branches.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setSelectedBranch(b);
                    setIsBranchOpen(false);
                  }}
                  className={cn(
                    'w-full rounded-md px-3 py-1.5 text-left text-xs',
                    selectedBranch === b ? 'bg-amber-500 font-semibold text-white' : 'text-slate-300 hover:bg-white/5',
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-semibold text-amber-300">
              {staff.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold leading-tight text-white">{staff.name}</p>
              <p className="text-[10px] capitalize text-slate-400">{staff.role}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOutOfPortal();
              onSignOut();
            }}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-rose-400"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <p className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-slate-500">
          <RestoFlowMark size={14} /> Powered by RestoFlow
        </p>
      </div>
    </aside>
  );
};
