'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  MenuItem,
  OrderItem,
  Order,
  DietaryPreference,
  SpiceLevel,
  MenuItemPairing,
  MenuCategory,
} from '@/types';
import { useRestaurant } from '@/features/restaurants/context/RestaurantContext';
import type { Restaurant } from '@/features/restaurants/types';
import { fetchGuest, signOutGuest as signOutGuestApi, type GuestProfile } from '@/features/guest/services/guestService';
import { api, ApiError } from '@/lib/api';
import { readJson, writeJson, removeKey } from '@/lib/storage';

type Portion = 'half' | 'full';
type PayMethod = 'upi' | 'card' | 'cash';

export type CustomerScreen =
  | 'home'
  | 'menu'
  | 'help-me-choose'
  | 'popular'
  | 'orders'
  | 'cart'
  | 'bill'
  | 'review'
  | 'play';

export interface FilterState {
  category: string;
  dietaryFilter: 'all' | 'veg' | 'non-veg';
  dietaryPreferences: DietaryPreference[];
  spiceLevel: SpiceLevel | 'all';
  priceRange: 'all' | 'under-200' | '200-400' | '400-600' | '600-plus';
  sortBy: 'popular' | 'rating' | 'price-low' | 'price-high' | 'newest';
  searchQuery: string;
}

interface CustomerContextType {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  categories: MenuCategory[];
  /** Signed-in guest (mobile login), or null while browsing anonymously. */
  guest: GuestProfile | null;
  /** Runs `then` immediately if signed in, otherwise opens the sign-in sheet and runs it after login. */
  requireLogin: (then?: (profile: GuestProfile) => void) => void;
  completeLogin: (profile: GuestProfile) => void;
  signOutGuest: () => void;
  isAuthOpen: boolean;
  closeAuth: () => void;
  activeScreen: CustomerScreen;
  setActiveScreen: (screen: CustomerScreen) => void;
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  cart: OrderItem[];
  addToCart: (item: MenuItem, quantity?: number, pairings?: MenuItemPairing[], portion?: Portion) => void;
  /** One-tap add from a card: adds directly, or opens the dish so the guest can pick half or full plate. */
  quickAddToCart: (item: MenuItem) => void;
  updateCartItemQty: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  /** The guest's orders at this restaurant over the last day, newest first. Refreshed every few seconds. */
  orders: Order[];
  /** Newest order that has not been cancelled. */
  activeOrder: Order | null;
  /** The guest's newest order that the kitchen has not served yet. Games are offered only while this is set. */
  waitingOrder: Order | null;
  /** Orders the guest still has to pay for. */
  unpaidOrders: Order[];
  submitOrder: (notes?: string) => void;
  isPlacingOrder: boolean;
  orderError: string;
  /** Tells the restaurant how the guest will pay. Staff confirm payment in their portal. */
  requestPayment: (method: PayMethod) => Promise<void>;
  refreshOrders: () => Promise<void>;
  selectedDish: MenuItem | null;
  setSelectedDish: (dish: MenuItem | null) => void;
  isFilterSheetOpen: boolean;
  setIsFilterSheetOpen: (open: boolean) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  favoriteDishIds: string[];
  toggleFavorite: (dishId: string) => void;
}

const defaultFilters: FilterState = {
  category: 'all',
  dietaryFilter: 'all',
  dietaryPreferences: [],
  spiceLevel: 'all',
  priceRange: 'all',
  sortBy: 'popular',
  searchQuery: '',
};

const POLL_MS = 5000;

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ tableName: string; children: React.ReactNode }> = ({
  tableName,
  children,
}) => {
  const restaurant = useRestaurant();
  const cartKey = `restoflow:cart:${restaurant.slug}:${tableName}`;
  const [activeScreen, setScreen] = useState<CustomerScreen>('home');
  const [selectedTable, setSelectedTable] = useState<string>(tableName);
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const pendingAfterLogin = useRef<((profile: GuestProfile) => void) | null>(null);

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [favoriteDishIds, setFavoriteDishIds] = useState<string[]>([]);

  // Restore the signed-in guest (server cookie) and an unsent cart from this browser tab.
  useEffect(() => {
    fetchGuest().then(setGuest);
    setCart(readJson<OrderItem[]>(cartKey, []));
  }, [cartKey]);

  useEffect(() => {
    if (cart.length > 0) writeJson(cartKey, cart);
    else removeKey(cartKey);
  }, [cart, cartKey]);

  const refreshOrders = useCallback(async () => {
    try {
      setOrders((await api<{ orders: Order[] }>(`/api/r/${restaurant.slug}/orders`)).orders);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setOrders([]);
    }
  }, [restaurant.slug]);

  // Live order tracking: poll while a guest is signed in and the tab is visible.
  useEffect(() => {
    if (!guest) {
      setOrders([]);
      return;
    }
    refreshOrders();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshOrders();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [guest, refreshOrders]);

  const requireLogin = useCallback(
    (then?: (profile: GuestProfile) => void) => {
      if (guest) {
        then?.(guest);
        return;
      }
      pendingAfterLogin.current = then ?? null;
      setIsAuthOpen(true);
    },
    [guest],
  );

  const completeLogin = (profile: GuestProfile) => {
    setGuest(profile);
    setIsAuthOpen(false);
    const next = pendingAfterLogin.current;
    pendingAfterLogin.current = null;
    next?.(profile);
  };

  const closeAuth = () => {
    pendingAfterLogin.current = null;
    setIsAuthOpen(false);
  };

  const signOutGuest = () => {
    void signOutGuestApi();
    setGuest(null);
    setOrders([]);
  };

  // Giving feedback needs a signed-in guest; everything else is open to browse.
  const setActiveScreen = (screen: CustomerScreen) => {
    if (screen === 'play' && !waitingOrder) return;
    if (screen === 'review' || screen === 'orders' || screen === 'bill') {
      requireLogin(() => setScreen(screen));
      return;
    }
    setScreen(screen);
  };

  const addToCart = (
    item: MenuItem,
    quantity = 1,
    selectedPairings?: MenuItemPairing[],
    portion: Portion = 'full',
  ) => {
    const hasHalf = item.halfPrice !== undefined;
    const size: Portion = hasHalf ? portion : 'full';
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id && (i.portion ?? 'full') === size);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: Math.min(20, i.quantity + quantity), selectedPairings } : i,
        );
      }
      return [
        ...prev,
        {
          id: `item_${Date.now()}_${Math.random()}`,
          menuItemId: item.id,
          name: hasHalf ? `${item.name} (${size === 'half' ? 'Half' : 'Full'} plate)` : item.name,
          price: size === 'half' ? item.halfPrice ?? item.price : item.price,
          portion: size,
          quantity,
          image: item.image,
          isVegetarian: item.isVegetarian,
          spiceLevel: item.spiceLevel,
          selectedPairings,
        },
      ];
    });
  };

  const quickAddToCart = (item: MenuItem) => {
    if (item.halfPrice !== undefined) setSelectedDish(item);
    else addToCart(item);
  };

  const updateCartItemQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = Math.min(20, item.quantity + delta);
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[],
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => {
    const pairingsTotal = item.selectedPairings?.reduce((pSum, p) => pSum + p.price, 0) || 0;
    return sum + (item.price + pairingsTotal) * item.quantity;
  }, 0);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  /** Sends the cart to the restaurant. Prices and totals are recalculated by the server from the live menu. */
  const placeOrder = async (notes?: string) => {
    if (cart.length === 0 || isPlacingOrder) return;
    setIsPlacingOrder(true);
    setOrderError('');
    try {
      await api(`/api/r/${restaurant.slug}/orders`, {
        method: 'POST',
        body: {
          tableName: selectedTable,
          items: cart.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity, portion: i.portion ?? 'full' })),
          notes: notes?.trim() || undefined,
        },
      });
      setCart([]);
      await refreshOrders();
      setScreen('orders');
    } catch (err) {
      setOrderError(err instanceof ApiError ? err.message : 'We could not place your order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Ordering needs a signed-in guest so the kitchen knows who to serve.
  const submitOrder = (notes?: string) => requireLogin(() => void placeOrder(notes));

  const activeOrder = useMemo(() => orders.find((o) => o.status !== 'cancelled') ?? null, [orders]);
  const waitingOrder = useMemo(
    () => orders.find((o) => o.status === 'new' || o.status === 'preparing' || o.status === 'ready') ?? null,
    [orders],
  );
  const unpaidOrders = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled' && o.paymentStatus !== 'paid'),
    [orders],
  );

  const requestPayment = async (method: PayMethod) => {
    await Promise.all(
      unpaidOrders.map((o) =>
        api(`/api/r/${restaurant.slug}/orders/${o.id}/pay`, { method: 'POST', body: { method } }),
      ),
    );
    await refreshOrders();
  };

  const resetFilters = () => setFilters(defaultFilters);

  const toggleFavorite = (dishId: string) => {
    setFavoriteDishIds((prev) => (prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]));
  };

  return (
    <CustomerContext.Provider
      value={{
        restaurant,
        menuItems: restaurant.menu,
        categories: restaurant.categories,
        guest,
        requireLogin,
        completeLogin,
        signOutGuest,
        isAuthOpen,
        closeAuth,
        activeScreen,
        setActiveScreen,
        selectedTable,
        setSelectedTable,
        cart,
        addToCart,
        quickAddToCart,
        updateCartItemQty,
        clearCart,
        cartTotal,
        cartItemCount,
        orders,
        activeOrder,
        waitingOrder,
        unpaidOrders,
        submitOrder,
        isPlacingOrder,
        orderError,
        requestPayment,
        refreshOrders,
        selectedDish,
        setSelectedDish,
        isFilterSheetOpen,
        setIsFilterSheetOpen,
        filters,
        setFilters,
        resetFilters,
        favoriteDishIds,
        toggleFavorite,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
