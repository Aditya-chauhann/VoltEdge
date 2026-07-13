'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { getApiError } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area,
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await adminApi.dashboard();
      setData(res.data.data);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-[400px] bg-white dark:bg-gray-900 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  const { stats, funnel, pendingActions, recentOrders } = data;

  // Formatting for Recharts
  const funnelData = [
    { name: 'Placed', count: funnel.placed },
    { name: 'Confirmed', count: funnel.confirmed },
    { name: 'Shipped', count: funnel.shipped },
    { name: 'Delivered', count: funnel.delivered },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* ─── Pending Actions (Bright Alert Cards) ─── */}
      {(pendingActions.ordersToConfirm > 0 || pendingActions.returnsRequested > 0 || pendingActions.refundsPending > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingActions.refundsPending > 0 && (
            <Link href="/admin/orders?status=cancelled&paymentStatus=paid">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between hover:bg-orange-500/20 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-medium">Refunds Pending</h3>
                    <p className="text-sm text-orange-200">Cancelled prepaid orders</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-400 group-hover:scale-110 transition-transform">
                  {pendingActions.refundsPending}
                </div>
              </motion.div>
            </Link>
          )}
          {pendingActions.ordersToConfirm > 0 && (
            <Link href="/admin/orders?status=placed">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 flex items-center justify-between hover:bg-primary-500/20 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-medium">Orders to Confirm</h3>
                    <p className="text-sm text-primary-200">Awaiting your approval</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary-400 group-hover:scale-110 transition-transform">
                  {pendingActions.ordersToConfirm}
                </div>
              </motion.div>
            </Link>
          )}

          {pendingActions.returnsRequested > 0 && (
            <Link href="/admin/orders?status=return_requested">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between hover:bg-red-500/20 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertCircle size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-medium">Returns Requested</h3>
                    <p className="text-sm text-red-200">Require manual review</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-400 group-hover:scale-110 transition-transform">
                  {pendingActions.returnsRequested}
                </div>
              </motion.div>
            </Link>
          )}
        </div>
      )}

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          subvalue={`+₹${stats.monthRevenue.toLocaleString()} this month`}
          icon={<DollarSign size={20} className="text-emerald-400" />}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          subvalue={`+${stats.monthOrders} this month`}
          icon={<ShoppingBag size={20} className="text-blue-400" />}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subvalue={`+${stats.newUsers} this month`}
          icon={<Users size={20} className="text-purple-400" />}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}`}
          subvalue="Lifetime average"
          icon={<TrendingUp size={20} className="text-orange-400" />}
        />
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Funnel Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Order Fulfillment Funnel</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-primary-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order._id} className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700/50">
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.user?.name || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white font-medium">₹{order.total}</p>
                    <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider mt-1
                      ${order.orderStatus === 'placed' ? 'bg-amber-500/10 text-amber-500' :
                        order.orderStatus === 'confirmed' ? 'bg-blue-500/10 text-blue-500' :
                        order.orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-gray-500/10 text-gray-600 dark:text-gray-400'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">No recent orders found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subvalue, icon }: { title: string; value: string; subvalue: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-gray-900 dark:text-white text-3xl font-display font-semibold mt-1 mb-1">{value}</p>
        <p className="text-gray-500 text-xs">{subvalue}</p>
      </div>
    </div>
  );
}
