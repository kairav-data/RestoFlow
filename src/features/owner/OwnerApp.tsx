'use client';

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useOwner } from './context/OwnerContext';
import { OwnerSidebar } from './components/OwnerSidebar';
import { OwnerDashboard } from './components/OwnerDashboard';
import { LiveOrdersKdsView } from './components/LiveOrdersKdsView';
import { MenuManagementView } from './components/MenuManagementView';
import { TableQrManagementView } from './components/TableQrManagementView';
import { GettingStarted } from './components/GettingStarted';
import { CustomersView } from '@/features/customers/components/CustomersView';
import { FeedbackInsightsView } from '@/features/feedback/components/FeedbackInsightsView';

export const OwnerApp: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const { activeSection, menuItems, orders, ordersLoaded, toast } = useOwner();

  // A brand-new restaurant has no menu or orders: guide setup instead of showing empty charts.
  const showSetup = activeSection === 'dashboard' && menuItems.length === 0 && ordersLoaded && orders.length === 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <OwnerSidebar onSignOut={onSignOut} />

      <div className="flex min-w-0 flex-1 flex-col">
        {activeSection === 'dashboard' && (showSetup ? <GettingStarted /> : <OwnerDashboard />)}
        {activeSection === 'orders' && <LiveOrdersKdsView />}
        {activeSection === 'menu' && <MenuManagementView />}
        {activeSection === 'tables-qr' && <TableQrManagementView />}
        {activeSection === 'customers' && <CustomersView />}
        {activeSection === 'analytics-feedback' && <FeedbackInsightsView />}
      </div>

      <div aria-live="polite" className="pointer-events-none fixed bottom-6 right-6 z-[90]">
        {toast && (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-elevated ${
              toast.tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {toast.tone === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
