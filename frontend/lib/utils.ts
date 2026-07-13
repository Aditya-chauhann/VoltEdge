import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useSettingsStore } from '@/store/settingsStore';

/** Format a number as the user's selected currency */
export function formatPrice(amountInINR: number): string {
  try {
    const state = useSettingsStore.getState();
    const currency = state.selectedCurrency || 'INR';
    
    let rate = 1;
    if (currency !== 'INR' && state.currencyRates) {
      // @ts-ignore
      rate = state.currencyRates[currency] || 1;
    }
    
    const convertedAmount = currency === 'INR' ? amountInINR : amountInINR / rate;
    
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style:    'currency',
      currency: currency,
      maximumFractionDigits: currency === 'INR' ? 0 : 2,
    }).format(convertedAmount);
  } catch (e) {
    // Fallback if store is not initialized during SSR
    return new Intl.NumberFormat('en-IN', {
      style:    'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amountInINR);
  }
}

/** Calculate discount percentage */
export function discountPct(original: number, sale: number): number {
  if (!original || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

/** Truncate a string to a given length with ellipsis */
export function truncate(str: string, max = 60): string {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + '…';
}

/** Converts seconds to a { hours, minutes, seconds } object */
export function secondsToTime(seconds: number): { hours: number; minutes: number; seconds: number } {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { hours: h, minutes: m, seconds: s };
}

/** Format a date string as a human-readable date */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  }).format(d);
}

/** Get the first image URL from a product's image array */
export function getProductImage(images: string[], index = 0): string {
  return images?.[index] ?? '/placeholder-product.png';
}

/** Map orderStatus to a human-readable label */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed:           'Order Placed',
  confirmed:        'Confirmed',
  processing:       'Processing',
  shipped:          'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
  return_requested: 'Return Requested',
  returned:         'Returned',
};

/** Order status steps for the progress tracker */
export const ORDER_STATUS_STEPS = [
  'placed',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
] as const;

/** Returns the step index (0-based) for a given order status */
export function getStatusStep(status: string): number {
  const idx = ORDER_STATUS_STEPS.indexOf(status as typeof ORDER_STATUS_STEPS[number]);
  return idx === -1 ? 0 : idx;
}

/** Generate star rating array [filled, half, empty] */
export function getStars(rating: number): { full: number; half: boolean; empty: number } {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
}

/** Debounce utility */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
