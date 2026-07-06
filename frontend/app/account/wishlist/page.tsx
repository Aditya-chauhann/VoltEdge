'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import ProductCard from '@/components/product/ProductCard';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function WishlistPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const { items, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (!isLoggedIn) { router.push('/'); return; }
    fetchWishlist();
  }, [isLoggedIn, router, fetchWishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-2xl text-white mb-6 flex items-center gap-2">
        <Heart size={22} className="text-danger" fill="currentColor" /> My Wishlist
        <span className="text-base font-normal text-gray-400">({items.length} items)</span>
      </h1>

      {items.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Heart size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="font-display font-bold text-white text-xl mb-2">Your wishlist is empty</p>
          <p className="text-gray-400 mb-6">Save your favourite gadgets here!</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
