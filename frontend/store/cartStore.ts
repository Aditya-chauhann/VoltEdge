'use client';
/**
 * Cart Store (Zustand)
 * Syncs with the server-side cart. Provides optimistic local state.
 */

import { create } from 'zustand';
import { Cart, CartItem } from '@/types';
import { cartApi, getApiError } from '@/lib/api';
import toast from 'react-hot-toast';

interface CartStore {
  cart:           Cart | null;
  isLoading:      boolean;
  isOpen:         boolean;    // controls CartDrawer visibility
  isLocked:       boolean;    // true when cart is locked for checkout

  // Computed
  itemCount:   () => number;
  subtotal:    () => number;

  // Actions
  fetchCart:   () => Promise<void>;
  addItem:     (productId: string, qty?: number, variantId?: string) => Promise<void>;
  updateItem:  (itemId: string, qty: number) => Promise<void>;
  removeItem:  (itemId: string) => Promise<void>;
  clearCart:   () => Promise<void>;
  lockCart:    () => Promise<void>;
  unlockCart:  () => Promise<void>;
  openDrawer:  () => void;
  closeDrawer: () => void;
  setCart:     (cart: Cart) => void;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  cart:      null,
  isLoading: false,
  isOpen:    false,
  isLocked:  false,

  // ── Computed ────────────────────────────────────────────────────────────────

  itemCount: () =>
    get().cart?.items.reduce((sum, i) => sum + i.qty, 0) ?? 0,

  subtotal: () =>
    get().cart?.items.reduce((sum, i) => sum + i.priceSnapshot * i.qty, 0) ?? 0,

  // ── Actions ─────────────────────────────────────────────────────────────────

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res  = await cartApi.get();
      const cart = res.data.data as Cart;
      set({ cart, isLocked: cart.lockedForCheckout });
    } catch (err) {
      console.error('Failed to fetch cart:', getApiError(err));
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, qty = 1, variantId) => {
    set({ isLoading: true });
    try {
      const promise = cartApi.add({ productId, qty, variantId });
      toast.promise(promise, {
        loading: 'Adding to cart...',
        success: 'Added to cart!',
        error: 'Failed to add item'
      });
      const res = await promise;
      const cart = res.data.data as Cart;
      set({ cart, isOpen: true });
    } catch (err) {
      // toast.error is handled by toast.promise automatically, but we might want to log it
      console.error(getApiError(err));
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (itemId, qty) => {
    try {
      const res  = await cartApi.update(itemId, qty);
      const cart = res.data.data as Cart;
      set({ cart });
    } catch (err) {
      toast.error(getApiError(err));
    }
  },

  removeItem: async (itemId) => {
    try {
      const res  = await cartApi.remove(itemId);
      const cart = res.data.data as Cart;
      set({ cart });
      toast.success('Item removed');
    } catch (err) {
      toast.error(getApiError(err));
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clear();
      set({ cart: null });
    } catch (err) {
      toast.error(getApiError(err));
    }
  },

  lockCart: async () => {
    try {
      await cartApi.lock();
      set({ isLocked: true });
    } catch (err) {
      toast.error(getApiError(err));
    }
  },

  unlockCart: async () => {
    try {
      await cartApi.unlock();
      set({ isLocked: false });
    } catch (err) {
      console.error('Failed to unlock cart:', getApiError(err));
    }
  },

  openDrawer:  () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  setCart:     (cart) => set({ cart, isLocked: cart.lockedForCheckout }),
}));
