'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, getApiError } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, User as UserIcon, Calendar, ShoppingBag, DollarSign, ShieldAlert, Wallet } from 'lucide-react';
import { AdminDrawer } from '@/components/ui/AdminDrawer';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Drawer state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Wallet form state
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.users({ search, limit: 50 });
      setUsers(res.data.data.users);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = async (id: string) => {
    setSelectedUserId(id);
    setDrawerLoading(true);
    try {
      const res = await adminApi.getUser(id);
      setUserDetail(res.data.data);
    } catch (err) {
      toast.error('Failed to load user details');
      setSelectedUserId(null);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!userDetail?.user) return;
    try {
      const newStatus = !userDetail.user.isBlocked;
      await adminApi.updateUser(userDetail.user._id, { blocked: newStatus });
      setUserDetail({
        ...userDetail,
        user: { ...userDetail.user, isBlocked: newStatus }
      });
      fetchUsers(); // refresh list
      toast.success(newStatus ? 'User blocked' : 'User unblocked');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetail?.user || !walletAmount || !walletReason) return;
    try {
      const res = await adminApi.updateUser(userDetail.user._id, {
        addWalletAmount: Number(walletAmount),
        walletReason
      });
      setUserDetail({
        ...userDetail,
        user: res.data.data
      });
      setWalletAmount('');
      setWalletReason('');
      fetchUsers();
      toast.success('Wallet updated successfully');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-white">Users</h2>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors w-64 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-40 bg-gray-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => handleOpenDrawer(u._id)}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-primary-500/50 hover:bg-gray-800/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                {u.isBlocked ? (
                  <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-red-500/10 text-red-500">Blocked</span>
                ) : (
                  <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-500">Active</span>
                )}
              </div>
              
              <h3 className="text-white font-medium truncate group-hover:text-primary-400 transition-colors">{u.name}</h3>
              <p className="text-sm text-gray-400 truncate mb-4">{u.email}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5" title="Total Orders">
                  <ShoppingBag size={14} />
                  <span>{u.orderCount || 0}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Total Spend">
                  <DollarSign size={14} />
                  <span>₹{u.totalSpend || 0}</span>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400">
              No users found matching "{search}"
            </div>
          )}
        </div>
      )}

      {/* User Detail Drawer */}
      <AdminDrawer
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        title={userDetail?.user?.name || 'User Details'}
      >
        {drawerLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : userDetail ? (
          <div className="space-y-8">
            {/* Overview Profile */}
            <div className="bg-gray-950 rounded-xl p-6 border border-gray-800 flex items-center gap-6">
               <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-3xl">
                  {userDetail.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{userDetail.user.name}</h3>
                  <p className="text-gray-400">{userDetail.user.email}</p>
                  <p className="text-gray-500 text-sm mt-1">{userDetail.user.phone || 'No phone number'}</p>
                </div>
            </div>

            {/* Wallet Section */}
            <div className="bg-gray-950 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="text-primary-400" />
                <h3 className="text-lg font-medium text-white">Store Wallet</h3>
              </div>
              <div className="text-3xl font-display font-bold text-white mb-6">
                ₹{userDetail.user.walletBalance || 0}
              </div>

              <form onSubmit={handleAddWallet} className="flex gap-3 mb-6">
                <input
                  type="number"
                  placeholder="Amount (use - for debit)"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Reason (e.g. Refund)"
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  className="flex-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                  required
                />
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors">
                  Adjust
                </button>
              </form>

              {userDetail.user.walletHistory?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">History</h4>
                  {userDetail.user.walletHistory.slice().reverse().map((h: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-800/50 last:border-0">
                      <div>
                        <p className="text-white">{h.description}</p>
                        <p className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</p>
                      </div>
                      <div className={`font-medium ${h.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.type === 'credit' ? '+' : '-'}₹{h.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="bg-gray-950 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-medium text-white mb-4">Order History</h3>
              {userDetail.orders?.length === 0 ? (
                <p className="text-gray-500">No orders placed yet.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {userDetail.orders.map((o: any) => (
                    <div key={o._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900">
                      <div>
                        <p className="text-sm text-white font-medium">{o.orderNumber}</p>
                        <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white font-medium">₹{o.total}</p>
                        <p className={`text-[10px] font-bold uppercase ${o.orderStatus === 'delivered' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {o.orderStatus}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-red-400 mb-1">Danger Zone</h3>
                  <p className="text-sm text-red-500/70">
                    {userDetail.user.isBlocked ? 'This user is currently blocked from making purchases.' : 'Block this user to prevent them from logging in or making purchases.'}
                  </p>
                </div>
                <button
                  onClick={handleBlockToggle}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    userDetail.user.isBlocked
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  <ShieldAlert size={16} />
                  {userDetail.user.isBlocked ? 'Unblock User' : 'Block User'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </AdminDrawer>
    </div>
  );
}
