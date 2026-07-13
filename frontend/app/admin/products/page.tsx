'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Package, Eye, EyeOff, Trash2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminApi, getApiError } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isLoggedIn, _hasHydrated } = useAuthStore();

  const [products,  setProducts]  = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isLoggedIn || user?.role !== 'admin') { router.push('/'); return; }
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user, page, search]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.products({ page, limit: LIMIT, search });
      setProducts(res.data.data.products);
      setTotal(res.data.data.pagination.total);
    } catch (err) {
      console.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      await adminApi.updateProduct(product._id, { isFeatured: !product.isFeatured });
      setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, isFeatured: !p.isFeatured } : p));
      toast.success(`Product ${product.isFeatured ? 'unfeatured' : 'featured'}`);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const toggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'unavailable' : 'active';
    try {
      await adminApi.updateProduct(product._id, { status: newStatus });
      setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, status: newStatus as 'active' | 'unavailable' | 'deleted' } : p));
      toast.success(`Product marked ${newStatus}`);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  if (isLoading && products.length === 0) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{total.toLocaleString()} products in catalog</p>
        </div>
        <button onClick={loadProducts} className="btn-ghost flex items-center gap-1.5 text-sm border border-gray-300 dark:border-gray-700 px-3 py-2 rounded-xl">
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="input-field pl-9 text-sm"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary-400/10">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Featured</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-primary-400/5 hover:bg-white/2 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.title}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0 border border-gray-300 dark:border-gray-700" />
                      )}
                      <div className="min-w-0">
                        <p className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.brand ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 dark:text-white font-semibold">{formatPrice(product.salePrice)}</p>
                    {product.price > product.salePrice && (
                      <p className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${product.stock === 0 ? 'bg-danger/20 text-danger' : product.stock < 10 ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                      {product.stock === 0 ? 'Out' : product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${product.status === 'active' ? 'bg-success/20 text-success' : 'bg-gray-600/30 text-gray-600 dark:text-gray-400'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleFeatured(product)}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                        product.isFeatured ? 'bg-gold/20 text-gold' : 'bg-gray-700/50 text-gray-500 hover:text-gold'
                      }`}
                      title={product.isFeatured ? 'Unfeature' : 'Feature'}
                    >
                      ★
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStatus(product)}
                        className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-white/10 transition-all"
                        title={product.status === 'active' ? 'Hide product' : 'Show product'}
                      >
                        {product.status === 'active' ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={() => deleteProduct(product._id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition-all"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="glass-card mt-6">
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </div>
    </div>
  );
}
