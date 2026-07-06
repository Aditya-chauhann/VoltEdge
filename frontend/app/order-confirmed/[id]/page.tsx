'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { ordersApi, getApiError } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import confetti from 'canvas-confetti';

// Lightweight confetti helper — fires once on load
function fireConfetti() {
  const count = 200;
  const defaults = { origin: { y: 0.7 } };
  function fire(particleRatio: number, opts: object) {
    (confetti as unknown as (opts: object) => void)({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2,  { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1,  { spread: 120, startVelocity: 45 });
}

export default function OrderConfirmedPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await ordersApi.get(id);
        setOrder(res.data.data);
        // Delay confetti slightly to let the page render
        setTimeout(fireConfetti, 400);
      } catch (err) {
        console.error(getApiError(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-primary"
      >
        <CheckCircle size={48} className="text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="font-display font-black text-4xl text-white mb-2">Order Placed!</h1>
        <p className="text-gray-400 mb-8">
          Thank you for shopping with VoltEdge. Your order has been confirmed!
        </p>

        {order && (
          <div className="glass-card p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500">Order Number</p>
                <p className="font-mono font-bold text-primary-400 text-lg">#{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="font-display font-bold text-white text-xl">{formatPrice(order.total)}</p>
              </div>
            </div>

            {/* Items preview */}
            <div className="border-t border-primary-400/10 pt-4 space-y-3">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <img src={item.image} alt={item.title}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-700 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">×{item.qty}</p>
                  </div>
                  <p className="text-xs font-medium text-white">{formatPrice(item.total)}</p>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="text-xs text-gray-500 pl-13">+{order.items.length - 3} more items</p>
              )}
            </div>

            <div className="border-t border-primary-400/10 pt-4 mt-4 flex items-center justify-between text-sm">
              <div>
                <p className="text-xs text-gray-500">Delivering to</p>
                <p className="text-gray-300">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Payment</p>
                <p className="text-gray-300 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              </div>
            </div>

            {order.estimatedDelivery && (
              <div className="mt-4 p-3 bg-primary-400/10 border border-primary-400/20 rounded-xl flex items-center gap-2">
                <Package size={16} className="text-primary-400 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  Estimated delivery: <span className="text-primary-400 font-semibold">{formatDate(order.estimatedDelivery)}</span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/account/orders/${id}`}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Package size={16} /> Track Order
          </Link>
          <Link href="/" className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Home size={16} /> Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
