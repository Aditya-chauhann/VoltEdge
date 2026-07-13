'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { productsApi, getApiError } from '@/lib/api';
import { Product, Pagination } from '@/types';
import { debounce } from '@/lib/utils';

import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [products,   setProducts]   = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading,  setIsLoading]  = useState(false);
  const [page, setPage] = useState(1);

  const doSearch = useCallback(async (q: string, pg: number) => {
    if (!q.trim()) { setProducts([]); return; }
    setIsLoading(true);
    try {
      const res = await productsApi.search(q, { page: pg, limit: 20 });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    doSearch(query, 1);
  }, [query, doSearch]);

  useEffect(() => {
    if (page > 1) doSearch(query, page);
  }, [page, query, doSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
          <Search size={22} className="text-primary-400" />
          {query ? `Results for "${query}"` : 'Search Products'}
        </h1>
        {pagination && !isLoading && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pagination.total.toLocaleString()} products found</p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-display font-bold text-gray-900 dark:text-white text-xl mb-2">No results found</p>
          <p className="text-gray-600 dark:text-gray-400">Try different keywords or browse all products</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p, idx) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.4) }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrev}
            className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNext}
            className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center"><SkeletonCard /></div>}>
      <SearchContent />
    </Suspense>
  );
}
