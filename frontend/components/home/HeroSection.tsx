'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Shield, Truck } from 'lucide-react';

const slides = [
  {
    id:          1,
    badge:       '🔥 Hot Deal',
    headline:    'Next-Gen Smartphones',
    subheadline: 'at Unreal Prices',
    description: 'Discover flagship phones from top brands — delivered fast across India.',
    cta:         { label: 'Shop Phones', href: '/category/smartphones-tablets' },
    accent:      '#6C63FF',
    image:       null, // Using CSS gradient art
    gradient:    'from-purple-900/50 via-base to-base',
    emoji:       '📱',
  },
  {
    id:          2,
    badge:       '💻 New Arrivals',
    headline:    'Laptops Built for',
    subheadline: 'Champions',
    description: 'Ultra-thin, ultra-powerful. From gaming beasts to business classics.',
    cta:         { label: 'Shop Laptops', href: '/category/laptops-computers' },
    accent:      '#00D4FF',
    image:       null,
    gradient:    'from-cyan-900/30 via-base to-base',
    emoji:       '💻',
  },
  {
    id:          3,
    badge:       '🎧 Premium Audio',
    headline:    'Hear Every',
    subheadline: 'Beat',
    description: 'Studio-quality headphones and earbuds. Wireless freedom, crystal sound.',
    cta:         { label: 'Shop Audio', href: '/category/headphones-earbuds' },
    accent:      '#FFD700',
    image:       null,
    gradient:    'from-yellow-900/20 via-base to-base',
    emoji:       '🎧',
  },
];

const features = [
  { icon: Zap,    label: 'Fast Delivery',    sub: 'Pan-India in 3–7 days' },
  { icon: Shield, label: 'Genuine Products', sub: '100% authentic gadgets' },
  { icon: Truck,  label: 'Free Shipping',    sub: 'On all orders' },
];

export default function HeroSection() {
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);

  // Auto-advance slides
  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };
  const prev = () => { setDirection(-1); setCurrent((c) => (c - 1 + slides.length) % slides.length); };
  const next = () => { setDirection(1);  setCurrent((c) => (c + 1) % slides.length); };

  const slide = slides[current];

  return (
    <section className="relative min-h-[85vh] flex flex-col overflow-hidden bg-gradient-hero">

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-[600px] h-[600px] bg-primary-400/5 rounded-full blur-3xl"
        />
      </div>

      {/* Grid lines decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px),
                           linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content */}
      <div className="relative flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Text side */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Badge */}
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                             bg-primary-400/10 border border-primary-400/30
                             text-sm font-semibold text-primary-400"
                >
                  {slide.badge}
                </motion.span>

                {/* Headline */}
                <div>
                  <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-none text-white">
                    {slide.headline}
                  </h1>
                  <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-none text-gradient mt-1">
                    {slide.subheadline}
                  </h1>
                </div>

                {/* Description */}
                <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
                  {slide.description}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link href={slide.cta.href} className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                    {slide.cta.label} <ArrowRight size={18} />
                  </Link>
                  <Link href="/products" className="btn-ghost text-base">
                    Browse All →
                  </Link>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {features.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 px-3 py-1.5
                                               bg-white/5 border border-white/10 rounded-full">
                      <Icon size={12} className="text-primary-400" />
                      <span className="text-xs text-gray-300 font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Visual / emoji side */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + '-visual'}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, ease: 'backOut' }}
                className="hidden lg:flex items-center justify-center"
              >
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  {/* Glow ring */}
                  <div
                    className="absolute inset-0 rounded-full blur-3xl opacity-30 scale-90"
                    style={{ background: `radial-gradient(circle, ${slide.accent}, transparent)` }}
                  />

                  {/* Main visual */}
                  <div
                    className="relative w-72 h-72 rounded-[3rem] flex items-center justify-center
                               glass-card border-2 animate-pulse-glow"
                    style={{ borderColor: `${slide.accent}40` }}
                  >
                    <span className="text-[9rem] select-none">{slide.emoji}</span>
                  </div>

                  {/* Floating badges */}
                  <motion.div
                    animate={{ x: [0, 8, 0], y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-4 -right-8 glass-card px-3 py-2 shadow-glow-primary"
                  >
                    <p className="text-xs text-gray-400">Starting from</p>
                    <p className="font-display font-bold text-primary-400">₹999</p>
                  </motion.div>

                  <motion.div
                    animate={{ x: [0, -5, 0], y: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -bottom-4 -left-8 glass-card px-3 py-2 shadow-glow-cyan"
                  >
                    <p className="text-xs text-gray-400">Free Shipping</p>
                    <p className="font-display font-bold text-cyan-400 text-sm">All Orders ✓</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slide controls */}
      <div className="relative pb-10 flex items-center justify-center gap-4">
        {/* Prev */}
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center
                     text-gray-400 hover:text-white hover:border-primary-400/40 transition-all"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === current
                  ? 'w-8 h-2 bg-primary-400'
                  : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={next}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center
                     text-gray-400 hover:text-white hover:border-primary-400/40 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
