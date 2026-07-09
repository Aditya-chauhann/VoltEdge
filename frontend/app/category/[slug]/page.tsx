'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ProductCard from '@/components/product/ProductCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { productsApi, getApiError } from '@/lib/api';
import { Product, Category, Pagination } from '@/types';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const [products,  setProducts]  = useState<Product[]>([]);
  const [category,  setCategory]  = useState<Category | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('createdAt-desc');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [sortField, sortOrder] = sort.split('-');
        const res = await productsApi.getByCategory(slug, { page, limit: 20, sort: sortField, order: sortOrder });
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
        setCategory(res.data.data.category);
      } catch (err) {
        console.error(getApiError(err));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [slug, page, sort]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            {category?.name ?? slug.replace(/-/g, ' ')}
          </h1>
          {category?.description && (
            <p className="text-sm text-gray-400 mt-1">{category.description}</p>
          )}
          {pagination && (
            <p className="text-xs text-gray-500 mt-1">{pagination.total.toLocaleString()} products</p>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="input-field py-2 text-sm w-auto"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="salePrice-asc">Price: Low to High</option>
          <option value="salePrice-desc">Price: High to Low</option>
          <option value="avgRating-desc">Top Rated</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((p, idx) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.5) }}>
              <ProductCard product={p} />
            </motion.div>
          ))
        }
      </div>

      {!isLoading && products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <p className="font-display text-white text-xl">No products in this category yet</p>
          <p className="text-gray-400 mt-2">Check back after the next sync!</p>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrev}
            className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
          <span className="px-4 py-2 text-sm text-gray-400">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNext}
            className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
