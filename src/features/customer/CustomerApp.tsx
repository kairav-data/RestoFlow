'use client';

import React from 'react';
import { useCustomer } from './context/CustomerContext';
import { CustomerHome } from './components/CustomerHome';
import { MenuListing } from './components/MenuListing';
import { HelpMeChooseWizard } from './components/HelpMeChooseWizard';
import { PopularNowView } from './components/PopularNowView';
import { CartModal } from './components/CartModal';
import { LiveOrderTrackingModal } from './components/LiveOrderTrackingModal';
import { BillAndPaymentModal } from './components/BillAndPaymentModal';
import { ReviewModal } from './components/ReviewModal';
import { DishDetailModal } from './components/DishDetailModal';
import { FilterBottomSheet } from './components/FilterBottomSheet';
import { CustomerBottomNav } from './components/CustomerBottomNav';
import { PlayWhileYouWaitScreen } from '@/features/games/components/PlayWhileYouWaitScreen';
import { PlayEntry } from '@/features/games/components/PlayEntry';
import { GuestAuthSheet } from '@/features/guest/components/GuestAuthSheet';

export const CustomerApp: React.FC = () => {
  const { activeScreen } = useCustomer();

  return (
    <div className="relative min-h-screen bg-slate-50">
      {activeScreen === 'home' && <CustomerHome />}
      {activeScreen === 'menu' && <MenuListing />}
      {activeScreen === 'help-me-choose' && <HelpMeChooseWizard />}
      {activeScreen === 'popular' && <PopularNowView />}
      {activeScreen === 'cart' && <CartModal />}
      {activeScreen === 'orders' && <LiveOrderTrackingModal />}
      {activeScreen === 'bill' && <BillAndPaymentModal />}
      {activeScreen === 'review' && <ReviewModal />}
      {activeScreen === 'play' && <PlayWhileYouWaitScreen />}

      <DishDetailModal />
      <FilterBottomSheet />
      <GuestAuthSheet />

      {(activeScreen === 'home' || activeScreen === 'menu') && <PlayEntry variant="pill" />}
      {activeScreen !== 'bill' && <CustomerBottomNav />}
    </div>
  );
};
