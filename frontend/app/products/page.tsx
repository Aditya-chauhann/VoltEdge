'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { productsApi, getApiError } from '@/lib/api';
import { Product, Pagination, Category } from '@/types';

import { Suspense } from 'react';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'salePrice-asc',  label: 'Price: Low to High' },
  { value: 'salePrice-desc', label: 'Price: High to Low' },
  { value: 'avgRating-desc', label: 'Top Rated' },
  { value: 'reviewCount-desc', label: 'Most Popular' },
];

function ProductsContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [products,    setProducts]    = useState<Product[]>([]);
  const [pagination,  setPagination]  = useState<Pagination | null>(null);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [sort,      setSort]      = useState('createdAt-desc');
  const [minPrice,  setMinPrice]  = useState('');
  const [maxPrice,  setMaxPrice]  = useState('');
  const [category,  setCategory]  = useState('');
  const [inStock,   setInStock]   = useState(false);
  const [page,      setPage]      = useState(1);

  // Read flags from searchParams
  const featured   = searchParams.get('featured');
  const bestSeller = searchParams.get('bestSeller');
  const newArrival = searchParams.get('newArrival');
  const trending   = searchParams.get('trending');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sortField, sortOrder] = sort.split('-');
      const params: Record<string, string> = {
        page:  String(page),
        limit: '20',
        sort:  sortField,
        order: sortOrder,
      };
      if (minPrice)  params.minPrice  = minPrice;
      if (maxPrice)  params.maxPrice  = maxPrice;
      if (category)  params.category  = category;
      if (inStock)   params.inStock   = 'true';
      if (featured)  params.featured  = 'true';
      if (bestSeller) params.bestSeller = 'true';
      if (newArrival) params.newArrival = 'true';
      if (trending)  params.trending  = 'true';

      const res = await productsApi.list(params);
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [sort, minPrice, maxPrice, category, inStock, page, featured, bestSeller, newArrival, trending]);

  useEffect(() => {
    productsApi.getCategories().then((r) => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetFilters = () => {
    setSort('createdAt-desc');
    setMinPrice('');
    setMaxPrice('');
    setCategory('');
    setInStock(false);
    setPage(1);
  };

  const pageTitle = featured ? 'Featured Products'
    : bestSeller ? 'Best Sellers'
    : newArrival ? 'New Arrivals'
    : trending   ? 'Trending Now'
    : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">{pageTitle}</h1>
          {pagination && (
            <p className="text-sm text-gray-400 mt-1">{pagination.total.toLocaleString()} products</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="input-field py-2 text-sm w-auto"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 btn-secondary py-2 px-4 text-sm lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Filter Sidebar ─────────────────────────────────────── */}
        <aside className={`
          ${filtersOpen ? 'block' : 'hidden'} lg:block
          w-64 flex-shrink-0 space-y-6
        `}>
          <div className="glass-card p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Filters</h3>
              <button onClick={resetFilters} className="text-xs text-primary-400 hover:underline">
                Reset all
              </button>
            </div>

            {/* Category filter */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="input-field py-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                Price Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="input-field py-2 text-sm"
                />
                <span className="text-gray-500">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="input-field py-2 text-sm"
                />
              </div>
            </div>

            {/* In stock only */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => { setInStock(e.target.checked); setPage(1); }}
                className="w-4 h-4 accent-primary-400"
              />
              <span className="text-sm text-gray-300">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* ── Product Grid ────────────────────────────────────────── */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p, idx) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.5) }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))
            }
          </div>

          {!isLoading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-xl font-display font-bold text-white mb-2">No products found</p>
              <p className="text-gray-400">Try adjusting your filters</p>
              <button onClick={resetFilters} className="btn-primary mt-4">Reset Filters</button>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNext}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center"><SkeletonCard /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
