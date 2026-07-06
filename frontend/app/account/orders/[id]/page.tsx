'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ExternalLink, Package, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ordersApi, getApiError } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import OrderProgressTracker from '@/components/order/OrderProgressTracker';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params   = useParams<{ id: string }>();
  const router   = useRouter();
  const { isLoggedIn } = useAuthStore();

  const [order,     setOrder]     = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/'); return; }
    async function load() {
      setIsLoading(true);
      try {
        const res = await ordersApi.get(params.id);
        setOrder(res.data.data);
      } catch (err) {
        console.error(getApiError(err));
        toast.error('Order not found');
        router.push('/account/orders');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.id, isLoggedIn, router]);

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(order._id, 'Customer requested cancellation');
      const freshRes = await ordersApi.get(order._id);
      setOrder(freshRes.data.data);
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!order)    return null;

  const canCancel = ['placed', 'confirmed'].includes(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft size={16} /> My Orders
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Order #{order.orderNumber}</h1>
          <p className="text-sm text-gray-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="btn-ghost text-danger flex items-center gap-1.5 text-sm border border-danger/30 px-3 py-2 rounded-xl hover:bg-danger/10"
          >
            <X size={14} />
            Cancel Order
          </button>
        )}
      </div>

      {/* Order progress */}
      <OrderProgressTracker
        currentStatus={order.orderStatus}
        statusHistory={order.statusHistory}
        className="mb-6"
      />

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="glass-card p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Tracking Number</p>
            <p className="font-mono font-semibold text-white text-lg">{order.trackingNumber}</p>
          </div>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
              Track <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}

      {/* Items */}
      <div className="glass-card p-6 mb-6">
        <h2 className="font-display font-semibold text-white mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center">
              <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-xl border border-gray-700 flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png'; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{item.title}</p>
                <p className="text-xs text-gray-400">Qty: {item.qty} × {formatPrice(item.unitPrice)}</p>
              </div>
              <p className="font-semibold text-white whitespace-nowrap">{formatPrice(item.total)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary + Address */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Order summary */}
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Shipping</span><span className="text-success">FREE</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-success">-{formatPrice(order.discount)}</span></div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-primary-400/10 pt-2 mt-1">
              <span className="text-white">Total</span>
              <span className="text-gradient">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-gray-500">Payment</span>
              <span className="text-gray-300 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Payment Status</span>
              <span className={`capitalize ${order.paymentStatus === 'paid' ? 'text-success' : order.paymentStatus === 'failed' ? 'text-danger' : 'text-warning'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-3">Delivery Address</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p>{order.shippingAddress.pincode}</p>
            <p className="text-gray-400 mt-2">📞 {order.shippingAddress.phone}</p>
          </div>
          {order.estimatedDelivery && (
            <div className="mt-3 pt-3 border-t border-primary-400/10">
              <p className="text-xs text-gray-500">Estimated Delivery</p>
              <p className="text-sm text-primary-400 font-medium">{formatDate(order.estimatedDelivery)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-base-100 border border-gray-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-2">Cancel Order</h3>
            <p className="text-sm text-gray-400 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="btn-ghost text-sm py-2 px-4 border border-gray-600 rounded-lg hover:bg-gray-800"
              >
                No, Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn-primary bg-danger hover:bg-danger/80 shadow-glow-danger text-sm py-2 px-4 border-none"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
