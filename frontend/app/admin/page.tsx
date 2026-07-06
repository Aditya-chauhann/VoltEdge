'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3, Package, Users, ShoppingCart, RefreshCw,
  TrendingUp, ArrowUpRight, DollarSign, AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminApi, getApiError } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface DashboardData {
  totalOrders:    number;
  totalRevenue:   number;
  totalProducts:  number;
  totalUsers:     number;
  pendingOrders:  number;
  recentOrders:   { _id: string; orderNumber: string; total: number; orderStatus: string; createdAt: string }[];
  lowStockProducts: { _id: string; title: string; stock: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuthStore();
  const [data,     setData]     = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') {
      router.push('/');
      return;
    }
    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user, router]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.dashboard();
      setData(res.data.data);
    } catch (err) {
      console.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      await adminApi.triggerSync();
      toast.success('Product sync started in the background');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!data)     return null;

  const stats = [
    { label: 'Total Revenue',  value: formatPrice(data.totalRevenue),  icon: DollarSign, color: 'text-success',     bg: 'bg-success/10' },
    { label: 'Total Orders',   value: data.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-primary-400', bg: 'bg-primary-400/10' },
    { label: 'Products',       value: data.totalProducts.toLocaleString(), icon: Package,   color: 'text-cyan-400',    bg: 'bg-cyan-400/10' },
    { label: 'Customers',      value: data.totalUsers.toLocaleString(),  icon: Users,      color: 'text-warning',    bg: 'bg-warning/10' },
  ];

  const navItems = [
    { href: '/admin/orders',   label: 'Orders',   icon: ShoppingCart },
    { href: '/admin/products', label: 'Products', icon: Package },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={triggerSync} disabled={isSyncing}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-50">
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing…' : 'Sync Products'}
          </button>
          {navItems.map((n) => (
            <Link key={n.href} href={n.href}
              className="btn-ghost flex items-center gap-2 text-sm border border-gray-700 px-3 py-2 rounded-xl">
              <n.icon size={14} /> {n.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }, idx) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="glass-card p-5"
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="font-display font-bold text-2xl text-white">{value}</p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-primary-400 hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <Link key={order._id} href={`/admin/orders`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatPrice(order.total)}</p>
                      <span className="text-xs capitalize text-primary-400">{order.orderStatus}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning" /> Low Stock Alert
            </h2>
            {data.pendingOrders > 0 && (
              <span className="badge bg-warning/20 text-warning">{data.pendingOrders} pending</span>
            )}
          </div>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">All products well-stocked ✓</p>
          ) : (
            <div className="space-y-3">
              {data.lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/20">
                  <p className="text-sm text-gray-300 truncate flex-1 mr-4">{p.title}</p>
                  <span className={`badge ${p.stock === 0 ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
