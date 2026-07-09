'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, getApiError } from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, ChevronDown, Download, CheckSquare } from 'lucide-react';
import { AdminDrawer } from '@/components/ui/AdminDrawer';

const TABS = ['All', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'return_requested', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Drawer
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
    setSelectedIds([]); // reset selection on tab change
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (activeTab !== 'All') {
        params.status = activeTab;
      }
      const res = await adminApi.orders(params);
      setOrders(res.data.data.orders);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(orders.map(o => o._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async (status: string) => {
    if (selectedIds.length === 0) return;
    try {
      await adminApi.bulkUpdateOrders({ orderIds: selectedIds, orderStatus: status });
      toast.success(`Updated ${selectedIds.length} orders to ${status}`);
      setSelectedIds([]);
      fetchOrders();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-amber-500/10 text-amber-500';
      case 'confirmed': return 'bg-blue-500/10 text-blue-500';
      case 'processing': return 'bg-purple-500/10 text-purple-500';
      case 'shipped': return 'bg-indigo-500/10 text-indigo-500';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-500';
      case 'return_requested': return 'bg-red-500/10 text-red-500';
      case 'cancelled': return 'bg-gray-500/10 text-gray-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-white">Orders Pipeline</h2>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            {tab.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={selectedIds.length === orders.length && orders.length > 0}
            onChange={handleSelectAll}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-gray-900"
          />
          <span className="text-sm text-gray-400">
            {selectedIds.length} selected
          </span>
        </div>
        
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <select 
              onChange={(e) => {
                if (e.target.value) handleBulkUpdate(e.target.value);
                e.target.value = "";
              }}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2"
            >
              <option value="">Bulk Update Status...</option>
              <option value="confirmed">Mark Confirmed</option>
              <option value="processing">Mark Processing</option>
              <option value="shipped">Mark Shipped</option>
              <option value="delivered">Mark Delivered</option>
              <option value="cancelled">Mark Cancelled</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg border border-gray-700 transition-colors">
              <Download size={16} /> Invoice
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-800">
              <tr>
                <th className="p-4 w-4"></th>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                     <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">No orders found in this category.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={order._id} 
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                       <input 
                        type="checkbox" 
                        checked={selectedIds.includes(order._id)}
                        onChange={() => handleSelectOne(order._id)}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-gray-900"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      {order.user?.name || 'Guest'}<br/>
                      <span className="text-xs text-gray-500">{order.user?.email}</span>
                    </td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-white">₹{order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <AdminDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order ${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-950 p-4 rounded-xl border border-gray-800">
               <div>
                  <p className="text-sm text-gray-400">Total Amount</p>
                  <p className="text-2xl font-bold text-white">₹{selectedOrder.total}</p>
               </div>
               <div>
                 <span className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md ${getStatusColor(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus.replace('_', ' ')}
                 </span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                 <h4 className="text-sm font-medium text-gray-400 mb-2">Customer Info</h4>
                 <p className="text-white">{selectedOrder.shippingAddress?.fullName}</p>
                 <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress?.phone}</p>
                 <p className="text-gray-400 text-sm mt-2">
                   {selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.city}<br/>
                   {selectedOrder.shippingAddress?.state}, {selectedOrder.shippingAddress?.pincode}
                 </p>
               </div>
               <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                 <h4 className="text-sm font-medium text-gray-400 mb-2">Payment Details</h4>
                 <p className="text-white uppercase">{selectedOrder.paymentMethod}</p>
                 <p className={`text-sm ${selectedOrder.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                   Status: {selectedOrder.paymentStatus}
                 </p>
                 {selectedOrder.cjOrderId && (
                   <div className="mt-4 pt-4 border-t border-gray-800">
                     <p className="text-xs text-gray-500">Supplier Order ID</p>
                     <p className="text-sm text-primary-400 font-mono">{selectedOrder.cjOrderId}</p>
                   </div>
                 )}
               </div>
            </div>

            <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
               <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50">
                 <h4 className="text-sm font-medium text-white">Items Ordered</h4>
               </div>
               <div className="divide-y divide-gray-800">
                 {selectedOrder.items?.map((item: any) => (
                   <div key={item._id} className="p-4 flex gap-4">
                     <img src={item.image} alt="" className="w-16 h-16 object-cover rounded-lg bg-gray-900" />
                     <div className="flex-1">
                       <p className="text-sm text-white font-medium line-clamp-2">{item.title}</p>
                       <p className="text-xs text-gray-400 mt-1">{item.variantName}</p>
                       <div className="flex justify-between mt-2">
                         <span className="text-sm text-gray-400">Qty: {item.qty}</span>
                         <span className="text-sm text-white font-medium">₹{item.total}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
               <h4 className="text-sm font-medium text-gray-400 mb-4">Status Timeline</h4>
               <div className="space-y-4">
                 {selectedOrder.statusHistory?.map((history: any, idx: number) => (
                   <div key={idx} className="flex gap-4">
                     <div className="flex flex-col items-center">
                       <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                       {idx !== selectedOrder.statusHistory.length - 1 && (
                         <div className="w-0.5 h-full bg-gray-800 my-1" />
                       )}
                     </div>
                     <div className="pb-4">
                       <p className="text-sm text-white font-medium capitalize">{history.status.replace('_', ' ')}</p>
                       <p className="text-xs text-gray-500 mt-1">{history.message}</p>
                       <p className="text-[10px] text-gray-600 mt-1">{new Date(history.timestamp).toLocaleString()}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
