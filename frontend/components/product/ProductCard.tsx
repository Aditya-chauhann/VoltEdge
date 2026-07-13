'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, truncate, discountPct } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';

interface ProductCardProps {
  product:  Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority }: ProductCardProps) {
  const { isLoggedIn } = useAuthStore();
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { openAuthModal } = useUIStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const image       = !imageError && product.images?.[0] ? product.images[0] : '/placeholder-product.png';
  const discount    = discountPct(product.price, product.salePrice);
  const inWishlist  = isInWishlist(product._id);
  const inStock     = product.stock > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    if (!isLoggedIn) {
      openAuthModal('login', { productId: product._id, qty: 1 });
      return;
    }

    setIsAddingToCart(true);
    await addItem(product._id, 1);
    setIsAddingToCart(false);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      openAuthModal('login');
      return;
    }
    await toggleWishlist(product._id);
  };

  return (
    <Link href={`/products/${product._id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="product-card group relative h-full flex flex-col"
      >
        {/* Image container */}
        <div className="relative overflow-hidden bg-white dark:bg-base-100 aspect-square rounded-t-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={product.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discount > 0 && (
              <span className="badge bg-danger text-gray-900 dark:text-white">-{discount}%</span>
            )}
            {product.isNewArrival && (
              <span className="badge bg-success text-gray-900 dark:text-white">New</span>
            )}
            {product.isBestSeller && (
              <span className="badge bg-gradient-gold text-black">🔥 Hot</span>
            )}
            {!inStock && (
              <span className="badge bg-gray-600 text-gray-200">Out of Stock</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center
                        backdrop-blur-sm transition-all duration-200
                        ${inWishlist
                          ? 'bg-danger/90 text-gray-900 dark:text-white'
                          : 'bg-black/40 text-gray-300 hover:bg-danger/80 hover:text-gray-900 dark:text-white'}`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>

          {/* Quick add to cart overlay */}
          <div
            className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0
                       transition-transform duration-300"
          >
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isAddingToCart}
              className={`w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold
                         transition-all duration-200
                         ${inStock
                           ? 'bg-gradient-primary text-gray-900 dark:text-white hover:opacity-90'
                           : 'bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'}`}
            >
              {isAddingToCart ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding...
                </span>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          {/* Brand */}
          {product.brand && (
            <span className="text-xs text-primary-400 font-medium uppercase tracking-wide">
              {product.brand}
            </span>
          )}

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 dark:text-white leading-snug line-clamp-2">
            {product.title}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={star <= Math.round(product.avgRating) ? 'text-gold fill-gold' : 'text-gray-600'}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white">
              {formatPrice(product.salePrice)}
            </span>
            {discount > 0 && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {inStock && product.stock < 10 && (
            <p className="text-xs text-warning font-medium flex items-center gap-1">
              <Zap size={10} fill="currentColor" /> Only {product.stock} left!
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
