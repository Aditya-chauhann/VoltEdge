/**
 * Shared TypeScript types for the VoltEdge frontend.
 * These mirror the backend models for type-safe API interactions.
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id:        string;
  name:      string;
  email:     string;
  phone?:    string;
  role:      'customer' | 'admin';
  addresses: Address[];
  wishlist:  string[];
}

export interface AuthState {
  user:       User | null;
  token:      string | null;
  isLoggedIn: boolean;
}

// ─── Address ──────────────────────────────────────────────────────────────────

export interface Address {
  _id?:      string;
  fullName:  string;
  phone:     string;
  line1:     string;
  line2?:    string;
  city:      string;
  state:     string;
  pincode:   string;
  country:   string;
  isDefault: boolean;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  _id:         string;
  name:        string;
  slug:        string;
  description: string;
  image?:      string;
  icon?:       string;
  sortOrder:   number;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductVariant {
  variantId:   string;
  sku:         string;
  name:        string;
  price:       number;
  salePrice?:  number;
  stock:       number;
  attributes:  Record<string, string>;
}

export interface ProductSpec {
  key:   string;
  value: string;
}

export interface Product {
  _id:           string;
  cjProductId:   string;
  title:         string;
  description:   string;
  images:        string[];
  video?:        string;
  brand?:        string;
  price:         number;     // "original" price (for strikethrough)
  salePrice:     number;     // actual selling price
  discountPct?:  number;
  stock:         number;
  variants:      ProductVariant[];
  category:      Category | string;
  tags:          string[];
  specifications: ProductSpec[];
  avgRating:     number;
  reviewCount:   number;
  status:        'active' | 'unavailable' | 'deleted';
  isFeatured:    boolean;
  isBestSeller:  boolean;
  isNewArrival:  boolean;
  isTrending:    boolean;
  createdAt:     string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  _id:           string;
  product:       Product;
  variantId?:    string;
  qty:           number;
  priceSnapshot: number;
}

export interface Cart {
  _id:               string;
  user:              string;
  items:             CartItem[];
  lockedForCheckout: boolean;
  couponCode?:       string;
  couponDiscount:    number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  product:     string | Product;
  title:       string;
  image:       string;
  variantId?:  string;
  qty:         number;
  unitPrice:   number;
  total:       number;
}

export interface StatusEvent {
  status:     string;
  message?:   string;
  timestamp:  string;
}

export interface Order {
  _id:             string;
  orderNumber:     string;
  user:            string;
  items:           OrderItem[];
  shippingAddress: Address;
  subtotal:        number;
  shippingFee:     number;
  discount:        number;
  couponCode?:     string;
  total:           number;
  paymentMethod:   'razorpay' | 'cod';
  paymentStatus:   'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus:     string;
  statusHistory:   StatusEvent[];
  trackingNumber?: string;
  trackingUrl?:    string;
  estimatedDelivery?: string;
  createdAt:       string;
  updatedAt:       string;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  _id:          string;
  product:      string;
  user:         { _id: string; name: string };
  rating:       number;
  title?:       string;
  body:         string;
  images:       string[];
  isVerified:   boolean;
  helpfulCount: number;
  createdAt:    string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Pagination {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
  hasNext?:   boolean;
  hasPrev?:   boolean;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data:    T;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface RazorpayOptions {
  key:          string;
  amount:       number;
  currency:     string;
  order_id:     string;
  name:         string;
  description:  string;
  prefill?:     { name?: string; email?: string; contact?: string };
  theme?:       { color?: string };
  handler:      (response: {
    razorpay_payment_id: string;
    razorpay_order_id:   string;
    razorpay_signature:  string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

// Extend Window for Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}
