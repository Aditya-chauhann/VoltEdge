'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import { CartItem } from '@/types';

export default function CartDrawer() {
  const { isLoggedIn }        = useAuthStore();
  const {
    cart, isOpen, isLoading, isLocked,
    closeDrawer, updateItem, removeItem, subtotal,
  } = useCartStore();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeDrawer]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isLoggedIn) return null;

  const total     = subtotal();
  const items     = cart?.items ?? [];
  const isEmpty   = items.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-base-50 z-50
                       flex flex-col border-l border-primary-400/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-primary-400/10">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary-400" />
                <h2 className="font-display font-bold text-lg text-white">
                  My Cart
                  {items.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Locked notice */}
            {isLocked && (
              <div className="mx-5 mt-3 px-4 py-2 bg-warning/10 border border-warning/30 rounded-xl">
                <p className="text-xs text-warning font-medium">
                  🔒 Cart is locked during checkout. Complete or cancel checkout to make changes.
                </p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 bg-primary-400/10 rounded-full flex items-center justify-center">
                    <ShoppingBag size={36} className="text-primary-400/50" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-white mb-1">Your cart is empty</p>
                    <p className="text-sm text-gray-400">Add some amazing gadgets!</p>
                  </div>
                  <Link
                    href="/products"
                    onClick={closeDrawer}
                    className="btn-primary text-sm"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item: CartItem) => (
                    <CartItemRow
                      key={item._id}
                      item={item}
                      disabled={isLocked || isLoading}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isEmpty && (
              <div className="border-t border-primary-400/10 px-5 py-5">
                {/* Subtotal */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-display font-bold text-xl text-white">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Shipping calculated at checkout. Free shipping on all orders.
                </p>

                {/* Checkout button */}
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </Link>

                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="btn-ghost w-full flex items-center justify-center gap-2 mt-2 text-sm"
                >
                  View Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartItemRow({
  item, disabled, onUpdate, onRemove,
}: {
  item:     CartItem;
  disabled: boolean;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const product = item.product;
  const title   = typeof product === 'object' ? product.title : 'Product';
  const image   = typeof product === 'object' ? product.images?.[0] : '';
  const price   = item.priceSnapshot;

  return (
    <div className="flex gap-3 glass-card p-3">
      {/* Image */}
      <div className="w-16 h-16 bg-base-100 rounded-lg overflow-hidden flex-shrink-0">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <ShoppingBag size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        {item.variantId && (
          <p className="text-xs text-gray-400">{item.variantId}</p>
        )}
        <p className="text-sm font-bold text-primary-400 mt-0.5">
          {formatPrice(price)}
        </p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            disabled={disabled || item.qty <= 1}
            onClick={() => onUpdate(item._id, item.qty - 1)}
            className="w-6 h-6 rounded-md bg-base-100 flex items-center justify-center
                       text-gray-400 hover:text-white hover:bg-primary-400/20 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus size={12} />
          </button>
          <span className="text-sm font-medium text-white w-6 text-center">{item.qty}</span>
          <button
            disabled={disabled}
            onClick={() => onUpdate(item._id, item.qty + 1)}
            className="w-6 h-6 rounded-md bg-base-100 flex items-center justify-center
                       text-gray-400 hover:text-white hover:bg-primary-400/20 transition-all
                       disabled:opacity-40"
          >
            <Plus size={12} />
          </button>
          <span className="ml-auto text-xs text-gray-400">
            {formatPrice(price * item.qty)}
          </span>
          <button
            disabled={disabled}
            onClick={() => onRemove(item._id)}
            className="p-1 rounded text-gray-500 hover:text-danger transition-colors
                       disabled:opacity-40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
