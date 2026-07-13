'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Product } from '@/types';

interface SectionProps {
  products:  Product[];
  isLoading: boolean;
}

export function TrendingSection({ products, isLoading }: SectionProps) {
  return (
    <ProductSection
      badge="⚡ TRENDING"
      title="Trending Now"
      subtitle="What's flying off the shelves this week"
      href="/products?trending=true"
      products={products}
      isLoading={isLoading}
    />
  );
}

export function BestSellers({ products, isLoading }: SectionProps) {
  return (
    <ProductSection
      badge="🏆 BESTSELLERS"
      title="Best Sellers"
      subtitle="Top-rated by thousands of happy customers"
      href="/products?bestSeller=true"
      products={products}
      isLoading={isLoading}
      dark
    />
  );
}

export function NewArrivals({ products, isLoading }: SectionProps) {
  return (
    <ProductSection
      badge="✨ FRESH STOCK"
      title="New Arrivals"
      subtitle="Just landed — be the first to own it"
      href="/products?newArrival=true"
      products={products}
      isLoading={isLoading}
    />
  );
}

function ProductSection({
  badge, title, subtitle, href, products, isLoading, dark,
}: SectionProps & { badge: string; title: string; subtitle: string; href: string; dark?: boolean }) {
  return (
    <section className={`py-16 ${dark ? 'bg-gradient-to-b from-white to-cyan-50/30 dark:from-transparent dark:to-transparent dark:bg-base-50/30' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="badge bg-primary-400/20 text-primary-400 mb-2 inline-block">{badge}</span>
            <h2 className="section-heading">{title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          </div>
          <Link href={href} className="hidden sm:flex items-center gap-2 text-sm text-primary-400 hover:text-gray-900 dark:text-white transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : products.slice(0, 10).map((p, idx) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))
          }
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href={href} className="btn-secondary inline-flex items-center gap-2">
            View all <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
