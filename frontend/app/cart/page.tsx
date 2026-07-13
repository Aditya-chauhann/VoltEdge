'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useSettingsStore } from '@/store/settingsStore';
import { couponsApi, getApiError } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { CartItem } from '@/types';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart, subtotal } = useCartStore();
  const { openAuthModal } = useUIStore();
  const { minimumOrderAmount } = useSettingsStore();

  const [couponCode,  setCouponCode]  = useState('');
  const [couponDisc,  setCouponDisc]  = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [isApplying,  setIsApplying]  = useState(false);

  useEffect(() => {
    if (isLoggedIn) fetchCart();
  }, [isLoggedIn, fetchCart]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    try {
      const res  = await couponsApi.validate(couponCode.trim(), sub);
      const disc = res.data.data.discountAmount as number;
      setCouponDisc(disc);
      setCouponApplied(couponCode.trim().toUpperCase());
      toast.success(`Coupon applied! Saving ${formatPrice(disc)} 🎉`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDisc(0);
    setCouponApplied('');
    toast.success('Coupon removed');
  };

  const sub   = subtotal();
  const total = sub - couponDisc;
  const items = cart?.items ?? [];

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="glass-card p-12">
          <ShoppingBag size={56} className="text-gray-600 mx-auto mb-5" />
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-3">Sign in to view your cart</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Your cart items are saved to your account</p>
          <button onClick={() => openAuthModal('login')} className="btn-primary">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-8 flex items-center gap-3">
        <ShoppingBag size={28} className="text-primary-400" />
        Shopping Cart
        {items.length > 0 && (
          <span className="text-base font-normal text-gray-600 dark:text-gray-400">({items.length} items)</span>
        )}
      </h1>

      {items.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <ShoppingBag size={64} className="text-gray-600 mx-auto mb-5" />
          <p className="font-display font-bold text-gray-900 dark:text-white text-2xl mb-3">Your cart is empty</p>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Discover amazing electronics and add them to your cart</p>
          <Link href="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Items ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear all */}
            <div className="flex justify-end">
              <button onClick={() => clearCart()} className="text-xs text-danger hover:underline flex items-center gap-1">
                <Trash2 size={12} /> Clear all
              </button>
            </div>

            {items.map((item: CartItem, idx) => {
              const product = item.product;
              const title   = typeof product === 'object' ? product.title : 'Product';
              const image   = typeof product === 'object' ? product.images?.[0] : '';
              const prodId  = typeof product === 'object' ? product._id : '';

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card p-4 flex gap-4 items-start"
                >
                  {/* Image */}
                  <Link href={`/products/${prodId}`} className="flex-shrink-0">
                    <div className="w-24 h-24 bg-white dark:bg-base-100 rounded-xl overflow-hidden">
                      {image
                        ? <img src={image} alt={title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-500"><ShoppingBag size={24} /></div>
                      }
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${prodId}`}>
                      <p className="font-medium text-gray-900 dark:text-white hover:text-primary-400 transition-colors line-clamp-2 text-sm">{title}</p>
                    </Link>
                    {item.variantId && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{item.variantId}</p>}

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty */}
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          disabled={item.qty <= 10 || isLoading}
                          onClick={() => updateItem(item._id, Math.max(1, item.qty - 10))}
                          className="px-2 h-7 rounded-md bg-white dark:bg-base-100 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-primary-400/10 transition-all disabled:opacity-40"
                        >
                          -10
                        </button>
                        <button
                          disabled={item.qty <= 1 || isLoading}
                          onClick={() => updateItem(item._id, item.qty - 1)}
                          className="w-7 h-7 rounded-md bg-white dark:bg-base-100 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-primary-400/10 transition-all disabled:opacity-40"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1) {
                              updateItem(item._id, val);
                            }
                          }}
                          disabled={isLoading}
                          className="w-12 h-7 text-center text-sm font-medium text-gray-900 dark:text-white bg-transparent border border-gray-200 dark:border-gray-700 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400 hide-number-spinners"
                        />
                        <button
                          disabled={isLoading}
                          onClick={() => updateItem(item._id, item.qty + 1)}
                          className="w-7 h-7 rounded-md bg-white dark:bg-base-100 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-primary-400/10 transition-all disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          disabled={isLoading}
                          onClick={() => updateItem(item._id, item.qty + 10)}
                          className="px-2 h-7 rounded-md bg-white dark:bg-base-100 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-primary-400/10 transition-all disabled:opacity-40"
                        >
                          +10
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatPrice(item.priceSnapshot * item.qty)}</p>
                        <p className="text-xs text-gray-500">{formatPrice(item.priceSnapshot)} each</p>
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item._id)}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* ── Summary ───────────────────────────────────────── */}
          <div className="space-y-4 h-fit sticky top-20">
            {/* Coupon */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Tag size={16} className="text-primary-400" /> Promo Code
              </h3>
              {couponApplied ? (
                <div className="flex items-center justify-between p-3 bg-success/10 border border-success/30 rounded-xl">
                  <div>
                    <p className="text-success font-semibold text-sm">{couponApplied}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Saving {formatPrice(couponDisc)}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon"
                    className="input-field flex-1 text-sm py-2"
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  />
                  <button onClick={applyCoupon} disabled={isApplying}
                    className="btn-secondary px-3 text-sm whitespace-nowrap py-2 disabled:opacity-50">
                    {isApplying ? '…' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal ({items.length} items)</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(sub)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-success font-medium">FREE</span>
                </div>
                {couponDisc > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatPrice(couponDisc)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-primary-400/10 pt-3">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gradient">{formatPrice(total)}</span>
                </div>
              </div>

              {total < minimumOrderAmount ? (
                <div className="mt-5 w-full flex flex-col gap-2">
                  <p className="text-xs text-warning text-center font-medium bg-warning/10 p-2 rounded-lg">
                    Minimum order value for wholesale is {formatPrice(minimumOrderAmount)}. Add {formatPrice(minimumOrderAmount - total)} more.
                  </p>
                  <button disabled className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 opacity-50 cursor-not-allowed">
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push('/checkout')}
                  className="btn-primary w-full mt-5 flex items-center justify-center gap-2 py-3.5"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
              )}

              <Link href="/products" className="btn-ghost w-full flex items-center justify-center text-sm mt-2">
                Continue Shopping
              </Link>
            </div>

            {/* Trust mini */}
            <div className="glass-card p-4 grid grid-cols-3 gap-2 text-center">
              {['Free Shipping', 'Secure Pay', '7-Day Returns'].map((t) => (
                <p key={t} className="text-xs text-gray-600 dark:text-gray-400">{t}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
