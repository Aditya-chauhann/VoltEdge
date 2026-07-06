'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import CountdownTimer from '@/components/ui/CountdownTimer';
import ProductCard from '@/components/product/ProductCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Product } from '@/types';

interface TodaysDealsProps {
  products: Product[];
  isLoading: boolean;
}

export default function TodaysDeals({ products, isLoading }: TodaysDealsProps) {
  // Deal ends at midnight tonight
  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="badge bg-danger text-white text-sm">🔥 HOT DEALS</span>
              <h2 className="section-heading">Today&apos;s Deals</h2>
            </div>
            <p className="text-sm text-gray-400">Hurry — prices drop back at midnight!</p>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1 text-right">Ends in:</p>
              <CountdownTimer endsAt={midnight} />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : products.slice(0, 5).map((p, idx) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))
          }
        </div>

        <div className="text-center mt-8">
          <Link href="/products?trending=true" className="btn-secondary inline-flex items-center gap-2">
            View All Deals <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
