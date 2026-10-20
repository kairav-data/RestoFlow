'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { MenuCategory, MenuItem, Order, OrderStatus } from '@/types';
import type { StaffProfile } from '@/features/restaurants/types';
import { useRestaurant } from '@/features/restaurants/context/RestaurantContext';
import { api, ApiError } from '@/lib/api';
import type { DishChanges, NewDish } from '@/features/menu/types';

export type OwnerNavSection =
  | 'dashboard'
  | 'orders'
  | 'menu'
  | 'tables-qr'
  | 'customers'
  | 'analytics-feedback'
  | 'settings';

export type { NewDish };

/** Outcome of a save. `added` counts dishes already saved when a multi-dish save stops part-way. */
export interface ActionResult {
  ok: boolean;
  error?: string;
  added?: number;
}

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error';
}

type PayMethod = 'upi' | 'card' | 'cash' | 'wallet';

interface OwnerContextType {
  staff: StaffProfile;
  activeSection: OwnerNavSection;
  setActiveSection: (section: OwnerNavSection) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  /** Orders from the last 24 hours, newest first. Refreshed every few seconds. */
  orders: Order[];
  ordersLoaded: boolean;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  markPaid: (orderId: string, method: PayMethod) => Promise<void>;
  menuItems: MenuItem[];
  categories: MenuCategory[];
  toggleItemAvailability: (itemId: string) => Promise<void>;
  addNewMenuItem: (item: NewDish) => Promise<ActionResult>;
  /** Saves in batches of 50 so a scan of hundreds of dishes works. `onProgress` reports how many are saved so far. */
  addNewMenuItems: (items: NewDish[], onProgress?: (done: number, total: number) => void) => Promise<ActionResult>;
  /** Pass undefined to stop offering a half plate. */
  setHalfPrice: (itemId: string, halfPrice: number | undefined) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
  /** Saves changes to an existing dish. Pass `halfPrice: null` / `nutrition: null` to clear them. */
  updateMenuItem: (itemId: string, changes: DishChanges) => Promise<ActionResult>;
  toast: Toast | null;
  notify: (message: string, tone?: Toast['tone']) => void;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

const POLL_MS = 4000;

export const OwnerProvider: React.FC<{ staff: StaffProfile; children: React.ReactNode }> = ({ staff, children }) => {
  const restaurant = useRestaurant();
  const [activeSection, setActiveSection] = useState<OwnerNavSection>('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<string>(restaurant.branches[0] ?? '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(restaurant.menu);
  const [categories, setCategories] = useState<MenuCategory[]>(restaurant.categories);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number>();

  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), tone === 'error' ? 9000 : 3000);
  }, []);

  const fail = useCallback(
    (err: unknown) => notify(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.', 'error'),
    [notify],
  );

  const refreshing = useRef(false);
  const refreshOrders = useCallback(async () => {
    // A slow connection must not stack up requests: skip this tick while the last one is still running.
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      setOrders((await api<{ orders: Order[] }>('/api/portal/orders?hours=24', { background: true })).orders);
      setOrdersLoaded(true);
    } catch {
      /* a failed background refresh keeps the last known orders on screen */
    } finally {
      refreshing.current = false;
    }
  }, []);

  // New orders from guests appear here without a page refresh.
  useEffect(() => {
    refreshOrders();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshOrders();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refreshOrders]);

  const applyMenu = (data: { menu: MenuItem[]; categories: MenuCategory[] }) => {
    setMenuItems(data.menu);
    setCategories(data.categories);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const { order } = await api<{ order: Order }>(`/api/portal/orders/${orderId}`, { method: 'PATCH', body: { status } });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    } catch (err) {
      fail(err);
      void refreshOrders();
    }
  };

  const markPaid = async (orderId: string, method: PayMethod) => {
    try {
      const { order } = await api<{ order: Order }>(`/api/portal/orders/${orderId}/payment`, { method: 'POST', body: { method } });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      notify(`Order ${order.orderNumber} marked as paid.`);
    } catch (err) {
      fail(err);
      void refreshOrders();
    }
  };

  const toApiDish = (d: NewDish) => ({
    name: d.name,
    description: d.description,
    price: d.price,
    halfPrice: d.halfPrice,
    category: d.category,
    isVegetarian: d.isVegetarian,
    spiceLevel: d.spiceLevel ?? 'mild',
    image: d.image,
    dietaryTags: d.dietaryTags ?? [],
    nutrition: d.nutrition,
  });

  const errorText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
  const MENU_BATCH = 50;

  const addNewMenuItems = async (items: NewDish[], onProgress?: (done: number, total: number) => void): Promise<ActionResult> => {
    let added = 0;
    try {
      for (let i = 0; i < items.length; i += MENU_BATCH) {
        const batch = items.slice(i, i + MENU_BATCH);
        applyMenu(await api('/api/portal/menu', { method: 'POST', body: { items: batch.map(toApiDish) } }));
        added += batch.length;
        onProgress?.(added, items.length);
      }
      notify(`${added} dish${added > 1 ? 'es' : ''} added to your menu.`);
      return { ok: true, added };
    } catch (err) {
      const error = errorText(err);
      notify(added > 0 ? `${added} of ${items.length} dishes were added, then it stopped: ${error}` : error, 'error');
      return { ok: false, error, added };
    }
  };

  const addNewMenuItem = (item: NewDish) => addNewMenuItems([item]);

  const patchItem = async (itemId: string, patch: Record<string, unknown>) => {
    try {
      applyMenu(await api(`/api/portal/menu/${itemId}`, { method: 'PATCH', body: patch }));
    } catch (err) {
      fail(err);
    }
  };

  const updateMenuItem = async (itemId: string, changes: DishChanges): Promise<ActionResult> => {
    try {
      applyMenu(await api(`/api/portal/menu/${itemId}`, { method: 'PATCH', body: changes }));
      notify('Dish updated.');
      return { ok: true };
    } catch (err) {
      fail(err);
      return { ok: false, error: errorText(err) };
    }
  };

  const toggleItemAvailability = async (itemId: string) => {
    const item = menuItems.find((m) => m.id === itemId);
    if (!item) return;
    // Optimistic: the toggle flips immediately and is rolled back by the refetch if the server refuses.
    setMenuItems((prev) => prev.map((m) => (m.id === itemId ? { ...m, isAvailable: !m.isAvailable } : m)));
    await patchItem(itemId, { isAvailable: !item.isAvailable });
  };

  const setHalfPrice = (itemId: string, halfPrice: number | undefined) =>
    patchItem(itemId, { halfPrice: halfPrice ?? null });

  const deleteMenuItem = async (itemId: string) => {
    try {
      const res = await api<{ removed: boolean; disabled?: boolean; menu: MenuItem[]; categories: MenuCategory[] }>(
        `/api/portal/menu/${itemId}`,
        { method: 'DELETE' },
      );
      applyMenu(res);
      notify(res.disabled ? 'This dish has past orders, so it was switched off instead of deleted.' : 'Dish deleted.');
    } catch (err) {
      fail(err);
    }
  };

  const value = useMemo<OwnerContextType>(
    () => ({
      staff,
      activeSection,
      setActiveSection,
      selectedBranch,
      setSelectedBranch,
      orders,
      ordersLoaded,
      refreshOrders,
      updateOrderStatus,
      markPaid,
      menuItems,
      categories,
      toggleItemAvailability,
      addNewMenuItem,
      addNewMenuItems,
      setHalfPrice,
      deleteMenuItem,
      updateMenuItem,
      toast,
      notify,
    }),
    // The mutation helpers close over state that is already in this dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [staff, activeSection, selectedBranch, orders, ordersLoaded, menuItems, categories, toast, refreshOrders, notify],
  );

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
};

export const useOwner = () => {
  const context = useContext(OwnerContext);
  if (!context) {
    throw new Error('useOwner must be used within an OwnerProvider');
  }
  return context;
};
