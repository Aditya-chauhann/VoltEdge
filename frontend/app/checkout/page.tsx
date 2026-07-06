'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, CreditCard, Truck, ChevronRight, Tag, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ordersApi, couponsApi, getApiError } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Address, RazorpayOptions } from '@/types';
import toast from 'react-hot-toast';

type Step = 'address' | 'payment';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const { cart, fetchCart, clearCart, lockCart, unlockCart, subtotal } = useCartStore();

  const [step,         setStep]         = useState<Step>('address');
  const [selectedAddr, setSelectedAddr] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [couponCode,   setCouponCode]   = useState('');
  const [couponDisc,   setCouponDisc]   = useState(0);
  const [isPlacing,    setIsPlacing]    = useState(false);
  const [isApplying,   setIsApplying]   = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/'); return; }
    fetchCart();
  }, [isLoggedIn, router, fetchCart]);

  useEffect(() => {
    if (user?.addresses?.[0]) {
      setSelectedAddr(user.addresses.find((a) => a.isDefault) ?? user.addresses[0]);
    }
  }, [user]);

  // Lock cart when entering checkout
  useEffect(() => {
    lockCart();
    return () => { unlockCart(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sub      = subtotal();
  const shipping = 0; // Free shipping
  const total    = sub - couponDisc + shipping;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    try {
      const res  = await couponsApi.validate(couponCode.trim(), total);
      const disc = res.data.data.discountAmount as number;
      setCouponDisc(disc);
      toast.success(`Coupon applied! You save ${formatPrice(disc)}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsApplying(false);
    }
  };

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script    = document.createElement('script');
      script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload   = () => resolve(true);
      script.onerror  = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    if (!selectedAddr) { toast.error('Please select a delivery address'); return; }
    if (!cart?.items.length) { toast.error('Your cart is empty'); return; }

    setIsPlacing(true);

    try {
      const orderData = {
        cartId:          cart._id,
        addressId:       selectedAddr._id,
        couponCode:      couponCode.trim() || undefined,
      };

      if (paymentMethod === 'cod') {
        const res = await ordersApi.placeCOD(orderData);
        const orderId = res.data.data.orderId as string;
        await clearCart();
        toast.success('Order placed! 🎉');
        router.push(`/account/orders/${orderId}`);
      } else {
        // Razorpay flow
        const ok = await loadRazorpay();
        if (!ok) { toast.error('Failed to load payment gateway'); setIsPlacing(false); return; }

        const createRes = await ordersApi.createRazorpay(orderData);
        const { razorpayOrderId, amount, currency, orderId } = createRes.data.data as {
          razorpayOrderId: string; amount: number; currency: string; orderId: string;
        };

        const options: RazorpayOptions = {
          key:          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount,
          currency,
          order_id:     razorpayOrderId,
          name:         'VoltEdge',
          description:  'Electronics Purchase',
          prefill: {
            name:    user?.name,
            email:   user?.email,
            contact: user?.phone,
          },
          theme: { color: '#6C63FF' },
          handler: async (response) => {
            try {
              await ordersApi.verifyRazorpay({
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId,
              });
              await clearCart();
              toast.success('Payment successful! 🎉');
              router.push(`/account/orders/${orderId}`);
            } catch (err) {
              toast.error('Payment verification failed. Contact support.');
            }
          },
          modal: {
            ondismiss: () => {
              setIsPlacing(false);
              toast('Payment cancelled', { icon: 'ℹ️' });
            },
          },
        };

        const rz = new window.Razorpay(options);
        rz.open();
        return; // Don't set isPlacing to false yet — Razorpay modal is open
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsPlacing(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="font-display font-bold text-2xl text-white mb-3">Your cart is empty</h2>
        <button onClick={() => router.push('/products')} className="btn-primary">Shop Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Lock size={20} className="text-primary-400" />
        <h1 className="font-display font-bold text-2xl text-white">Secure Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left (Steps) ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Address */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                <span className="w-7 h-7 bg-gradient-primary rounded-full text-sm flex items-center justify-center font-bold">1</span>
                Delivery Address
              </h2>
              {step === 'payment' && (
                <button onClick={() => setStep('address')} className="text-xs text-primary-400 hover:underline">
                  Change
                </button>
              )}
            </div>

            {user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3">
                {user.addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddr?._id === addr._id
                        ? 'border-primary-400 bg-primary-400/10'
                        : 'border-gray-700 hover:border-primary-400/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddr?._id === addr._id}
                      onChange={() => setSelectedAddr(addr)}
                      className="mt-1 accent-primary-400 flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-white text-sm">{addr.fullName}</p>
                      <p className="text-sm text-gray-400">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-xl">
                <AlertCircle size={18} className="text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-warning font-medium">No saved addresses</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Please add a delivery address in your{' '}
                    <button onClick={() => router.push('/account/profile')} className="text-primary-400 hover:underline">
                      profile
                    </button>.
                  </p>
                </div>
              </div>
            )}

            {step === 'address' && (
              <button
                onClick={() => { if (selectedAddr) setStep('payment'); else toast.error('Select an address'); }}
                className="btn-primary mt-5 flex items-center gap-2"
              >
                Continue to Payment <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2 mb-5">
                <span className="w-7 h-7 bg-gradient-primary rounded-full text-sm flex items-center justify-center font-bold">2</span>
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* Razorpay */}
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-primary-400 bg-primary-400/10'
                    : 'border-gray-700 hover:border-primary-400/40'
                }`}>
                  <input type="radio" name="payment" value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-primary-400"
                  />
                  <CreditCard size={20} className="text-primary-400" />
                  <div>
                    <p className="font-semibold text-white text-sm">Pay Online</p>
                    <p className="text-xs text-gray-400">UPI, Cards, Netbanking via Razorpay</p>
                  </div>
                  <span className="ml-auto badge bg-success/20 text-success">Recommended</span>
                </label>

                {/* COD */}
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-primary-400 bg-primary-400/10'
                    : 'border-gray-700 hover:border-primary-400/40'
                }`}>
                  <input type="radio" name="payment" value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-primary-400"
                  />
                  <Truck size={20} className="text-cyan-400" />
                  <div>
                    <p className="font-semibold text-white text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-400">Pay when your order arrives</p>
                  </div>
                </label>
              </div>

              {/* Coupon */}
              <div className="mt-5">
                <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Have a Coupon?</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="input-field pl-9 text-sm"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={isApplying}
                    className="btn-secondary px-4 text-sm whitespace-nowrap"
                  >
                    {isApplying ? '...' : 'Apply'}
                  </button>
                </div>
                {couponDisc > 0 && (
                  <p className="text-xs text-success mt-1.5 font-medium">
                    ✓ Coupon applied — saving {formatPrice(couponDisc)}
                  </p>
                )}
              </div>

              {/* Place order */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className="btn-primary w-full mt-6 py-4 text-base flex items-center justify-center gap-2"
              >
                {isPlacing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <><Lock size={16} /> Place Order — {formatPrice(total)}</>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* ── Order Summary ─────────────────────────────────────────── */}
        <div className="glass-card p-6 h-fit sticky top-20">
          <h3 className="font-display font-semibold text-white mb-5">Order Summary</h3>

          {/* Items */}
          <div className="space-y-3 mb-5 max-h-60 overflow-y-auto no-scrollbar">
            {cart.items.map((item) => {
              const product = item.product;
              const title   = typeof product === 'object' ? product.title : 'Product';
              const image   = typeof product === 'object' ? product.images?.[0] : '';
              return (
                <div key={item._id} className="flex gap-3 items-center">
                  {image && (
                    <img src={image} alt={title} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{title}</p>
                    <p className="text-xs text-gray-500">×{item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold text-white whitespace-nowrap">
                    {formatPrice(item.priceSnapshot * item.qty)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="border-t border-primary-400/10 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">{formatPrice(sub)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Shipping</span>
              <span className="text-success font-medium">FREE</span>
            </div>
            {couponDisc > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Coupon Discount</span>
                <span className="text-success">-{formatPrice(couponDisc)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-primary-400/10 pt-3 mt-1">
              <span className="text-white">Total</span>
              <span className="text-gradient">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
