'use client';
/**
 * Wishlist Store (Zustand)
 * Tracks wishlist product IDs locally for instant UI feedback.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApi, getApiError } from '@/lib/api';
import { Product } from '@/types';
import toast from 'react-hot-toast';

interface WishlistStore {
  items:    Product[];
  ids:      Set<string>;

  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  setIds: (ids: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  items: [],
  ids:   new Set<string>(),

  isInWishlist: (productId) => get().ids.has(productId),

  setIds: (ids) => set({ ids: new Set(ids) }),

  fetchWishlist: async () => {
    try {
      const res = await wishlistApi.get();
      const products = res.data.data as Product[];
      set({
        items: products,
        ids:   new Set(products.map((p) => p._id)),
      });
    } catch (err) {
      console.error('Failed to fetch wishlist:', getApiError(err));
    }
  },

  toggleWishlist: async (productId) => {
    const wasInWishlist = get().ids.has(productId);

    // Optimistic update
    set((state) => {
      const ids = new Set(state.ids);
      if (wasInWishlist) {
        ids.delete(productId);
      } else {
        ids.add(productId);
      }
      return { ids };
    });

    try {
      await wishlistApi.toggle(productId);
      toast.success(wasInWishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } catch (err) {
      // Revert on error
      set((state) => {
        const ids = new Set(state.ids);
        if (wasInWishlist) ids.add(productId);
        else ids.delete(productId);
        return { ids };
      });
      toast.error(getApiError(err));
    }
  },
}));
