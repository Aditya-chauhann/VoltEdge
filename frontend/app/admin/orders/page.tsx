'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminApi, getApiError } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled',
];

const STATUS_COLORS: Record<string, string> = {
  placed:           'bg-blue-400/20 text-blue-400',
  confirmed:        'bg-cyan-400/20 text-cyan-400',
  processing:       'bg-yellow-400/20 text-yellow-400',
  shipped:          'bg-purple-400/20 text-purple-400',
  out_for_delivery: 'bg-primary-400/20 text-primary-400',
  delivered:        'bg-success/20 text-success',
  cancelled:        'bg-danger/20 text-danger',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();

  const [orders,    setOrders]    = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch]    = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') { router.push('/'); return; }
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user, page, search, statusFilter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.orders({ page, limit: LIMIT, search, status: statusFilter });
      setOrders(res.data.data.orders);
      setTotal(res.data.data.pagination.total);
    } catch (err) {
      console.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await adminApi.updateOrder(orderId, { orderStatus: status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: status } : o));
      toast.success(`Order status updated to ${ORDER_STATUS_LABELS[status] ?? status}`);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  if (isLoading && orders.length === 0) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Order Management</h1>
          <p className="text-sm text-gray-400 mt-1">{total.toLocaleString()} total orders</p>
        </div>
        <button onClick={loadOrders} className="btn-ghost flex items-center gap-1.5 text-sm border border-gray-700 px-3 py-2 rounded-xl">
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order #..." className="input-field pl-9 text-sm py-2 w-52" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field text-sm py-2 w-auto">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s] ?? s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary-400/10">
                {['Order', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Update Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                  className="border-b border-primary-400/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/account/orders/${order._id}`} target="_blank"
                      className="font-mono text-primary-400 hover:underline flex items-center gap-1">
                      #{order.orderNumber} <ExternalLink size={11} />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <p className="truncate max-w-[120px]">{typeof order.user === 'string' ? order.user : '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold text-white">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-success/20 text-success' : order.paymentStatus === 'failed' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[order.orderStatus] ?? 'bg-gray-400/20 text-gray-400'}`}>
                      {ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="bg-base-100 border border-gray-700 rounded-lg text-xs text-gray-300 px-2 py-1.5 focus:outline-none focus:border-primary-400"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s] ?? s}</option>
                      ))}
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!isLoading && orders.length === 0 && (
            <p className="text-center text-gray-400 py-12">No orders found</p>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg glass-card text-gray-400 hover:text-white disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-400 px-3">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg glass-card text-gray-400 hover:text-white disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
