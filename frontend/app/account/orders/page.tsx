'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ordersApi, getApiError } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { SkeletonRow } from '@/components/ui/SkeletonCard';

const STATUS_COLORS: Record<string, string> = {
  placed:           'bg-blue-400/20 text-blue-400',
  confirmed:        'bg-cyan-400/20 text-cyan-400',
  processing:       'bg-yellow-400/20 text-yellow-400',
  shipped:          'bg-purple-400/20 text-purple-400',
  out_for_delivery: 'bg-primary-400/20 text-primary-400',
  delivered:        'bg-success/20 text-success',
  cancelled:        'bg-danger/20 text-danger',
  return_requested: 'bg-warning/20 text-warning',
  returned:         'bg-gray-400/20 text-gray-400',
};

export default function OrdersPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/'); return; }
    async function load() {
      setIsLoading(true);
      try {
        const res = await ordersApi.list({ limit: '20' });
        setOrders(res.data.data.orders);
      } catch (err) {
        console.error(getApiError(err));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isLoggedIn, router]);

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="h-8 bg-base-50 shimmer rounded w-40 mb-6" />
      <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display font-bold text-2xl text-white mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="font-display font-bold text-white text-xl mb-2">No orders yet</p>
          <p className="text-gray-400 mb-6">Start shopping to place your first order</p>
          <Link href="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/account/orders/${order._id}`}>
                <div className="glass-card p-5 hover:border-primary-400/40 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Order #{order.orderNumber}</p>
                      <span className={`badge ${STATUS_COLORS[order.orderStatus] ?? 'bg-gray-400/20 text-gray-400'}`}>
                        {ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-white">{formatPrice(order.total)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-2 mb-3">
                    {order.items.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-700"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                    )}
                    <p className="text-sm text-gray-300 ml-2">{order.items[0]?.title}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                    <span className="flex items-center gap-1 text-primary-400 group-hover:gap-2 transition-all">
                      View Details <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
