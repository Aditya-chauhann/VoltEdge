'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/types';

const CATEGORY_EMOJIS: Record<string, string> = {
  'accessories-parts':        '🔌',
  'home-audio-video':         '🔊',
  'smart-electronics':        '⌚',
  'camera-photo':             '📷',
  'video-games':              '🎮',
  'portable-audio-video':     '🎧',
};

const BG_COLORS = [
  'from-purple-900/40 to-purple-800/20',
  'from-blue-900/40 to-blue-800/20',
  'from-cyan-900/40 to-cyan-800/20',
  'from-green-900/40 to-green-800/20',
  'from-yellow-900/40 to-yellow-800/20',
  'from-red-900/40 to-red-800/20',
  'from-pink-900/40 to-pink-800/20',
  'from-indigo-900/40 to-indigo-800/20',
];

interface CategorySectionProps {
  categories: Category[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  const active = categories.slice(0, 8);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="badge bg-cyan-400/20 text-cyan-400 mb-2 inline-block">🗂️ SHOP BY</span>
          <h2 className="section-heading">Browse Categories</h2>
          <p className="text-sm text-gray-400 mt-1">Find exactly what you&apos;re looking for</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {active.map((cat, idx) => {
            const emoji = cat.icon ?? CATEGORY_EMOJIS[cat.slug] ?? '🔌';
            const bg    = BG_COLORS[idx % BG_COLORS.length];

            return (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
              >
                <Link href={`/category/${cat.slug}`}>
                  <div
                    className={`glass-card p-5 flex flex-col items-center text-center gap-3
                               bg-gradient-to-br ${bg} group cursor-pointer
                               hover:border-primary-400/40 transition-all duration-300`}
                  >
                    <motion.span
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      className="text-4xl select-none"
                    >
                      {emoji}
                    </motion.span>
                    <div>
                      <p className="font-semibold text-white text-sm group-hover:text-primary-400 transition-colors">
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
