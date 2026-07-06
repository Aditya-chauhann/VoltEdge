'use client';

import { Shield, Zap, RotateCcw, Headphones, Lock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const badges = [
  { icon: Shield,      label: 'Secure Payments',   sub: 'Razorpay encrypted',  color: 'text-success' },
  { icon: Zap,         label: 'Fast Delivery',      sub: '3–7 days pan-India',  color: 'text-primary-400' },
  { icon: RotateCcw,   label: 'Easy Returns',       sub: '7-day return window', color: 'text-cyan-400' },
  { icon: Headphones,  label: '24/7 Support',       sub: 'Always here for you', color: 'text-warning' },
  { icon: Lock,        label: 'Genuine Products',   sub: '100% authentic',      color: 'text-primary-400' },
  { icon: Star,        label: '5-Star Rated',        sub: '10,000+ happy buyers', color: 'text-gold' },
];

export default function TrustBadges() {
  return (
    <section className="py-10 border-y border-primary-400/10 bg-base-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map(({ icon: Icon, label, sub, color }, idx) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center text-center gap-2 p-4 glass-card
                         hover:border-primary-400/30 transition-all duration-300"
            >
              <Icon size={24} className={color} />
              <div>
                <p className="text-xs font-semibold text-white">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
