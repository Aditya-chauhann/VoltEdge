'use client';
/**
 * StoreProvider
 * Initializes the cart and wishlist from the server when the user is logged in.
 * Wraps the entire app so stores are populated on first render.
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();
  const { fetchCart }  = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
      fetchWishlist();
    }
  }, [isLoggedIn, fetchCart, fetchWishlist]);

  return <>{children}</>;
}
