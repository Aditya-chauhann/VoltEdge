'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Shield, Truck } from 'lucide-react';
import Image from 'next/image';

const DEFAULT_SLIDES = [
  {
    id:          1,
    badge:       '🔥 Hot Deal',
    headline:    'Next-Gen Smartphones',
    subheadline: 'at Unreal Prices',
    description: 'Discover flagship phones from top brands — delivered fast across India.',
    cta:         { label: 'Shop Cameras', href: '/category/camera-photo' },
    accent:      '#6C63FF',
    image:       '/images/hero_phone.png', // Images can stay for now
  },
  {
    id:          2,
    badge:       '💻 New Arrivals',
    headline:    'Laptops Built for',
    subheadline: 'Champions',
    description: 'Ultra-thin, ultra-powerful. From gaming beasts to business classics.',
    cta:         { label: 'Shop Games', href: '/category/video-games' },
    accent:      '#00D4FF',
    image:       '/images/hero_laptop.png',
  },
  {
    id:          3,
    badge:       '🎧 Premium Audio',
    headline:    'Hear Every',
    subheadline: 'Beat',
    description: 'Studio-quality headphones and earbuds. Wireless freedom, crystal sound.',
    cta:         { label: 'Shop Audio', href: '/category/headphones-earbuds' },
    accent:      '#FFD700',
    image:       '/images/hero_audio.png',
  },
];

const features = [
  { icon: Zap,    label: 'Fast Delivery',    sub: 'Pan-India in 3–7 days' },
  { icon: Shield, label: 'Genuine Products', sub: '100% authentic gadgets' },
  { icon: Truck,  label: 'Free Shipping',    sub: 'On all orders' },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '10%' : '-10%',
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "tween", duration: 1.0, ease: [0.65, 0, 0.35, 1] },
      opacity: { duration: 0.8 },
      scale: { duration: 1.0, ease: [0.65, 0, 0.35, 1] },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '10%' : '-10%',
    opacity: 0,
    scale: 1.05,
    transition: {
      x: { type: "tween", duration: 1.0, ease: [0.65, 0, 0.35, 1] },
      opacity: { duration: 0.8 },
      scale: { duration: 1.0, ease: [0.65, 0, 0.35, 1] },
    },
  }),
};

const textContainerVariants = {
  enter: { opacity: 0 },
  center: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 } 
  },
};

const textItemVariants = {
  enter: { y: 30, opacity: 0 },
  center: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.8, ease: [0.65, 0, 0.35, 1] } 
  },
  exit: { opacity: 0 },
};

const imageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    rotateY: direction > 0 ? 25 : -25,
    scale: 0.85,
  }),
  center: {
    x: 0,
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.65, 0, 0.35, 1],
      delay: 0.1,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    rotateY: direction < 0 ? 25 : -25,
    scale: 0.85,
    transition: {
      duration: 1.0,
      ease: [0.65, 0, 0.35, 1],
    },
  }),
};

export default function HeroSection({ banners }: { banners?: any[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Map dynamic banners to the structure expected by the hero, fallback to default
  const slides = (banners && banners.length > 0) 
    ? banners.map((b, i) => ({
        id: b._id,
        badge: 'Featured',
        headline: b.headline,
        subheadline: b.subtext || '',
        description: '',
        cta: { label: b.buttonLabel || 'Shop Now', href: b.buttonLink || '/shop' },
        accent: '#6C63FF', // Use a default or dynamic accent if available
        image: b.imageUrl,
        overlayOpacity: b.overlayDarkness / 100
      }))
    : DEFAULT_SLIDES;

  const slide = slides[current] || DEFAULT_SLIDES[0];

  const paginate = useCallback((newDirection: number, newIndex?: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(newDirection);
    
    if (newIndex !== undefined) {
      setCurrent(newIndex);
    } else {
      setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
    }
    
    // Unlock after transition duration
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  }, [slides.length, isAnimating]);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(id);
  }, [isPaused, paginate]);

  return (
    <section 
      className="relative min-h-[85vh] flex flex-col overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-cyan-100 dark:bg-gradient-hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated background blobs (global, not tied to slides) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], backgroundColor: [`${slide.accent}1a`, `${slide.accent}33`, `${slide.accent}1a`] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl transition-colors duration-1000"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"
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

      {/* Main content slider area */}
      <div className="relative flex-1 flex items-center justify-center perspective-[1000px]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center py-20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-center">
              <div className="grid lg:grid-cols-2 gap-12 items-center w-full">

                {/* Text side */}
                <motion.div
                  variants={textContainerVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 z-10"
                >
                  {/* Badge */}
                  <motion.span
                    variants={textItemVariants}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                               bg-primary-400/10 border border-primary-400/30
                               text-sm font-semibold text-primary-400"
                  >
                    {slide.badge}
                  </motion.span>

                  {/* Headline */}
                  <motion.div variants={textItemVariants}>
                    <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-none text-gray-900 dark:text-white">
                      {slide.headline}
                    </h1>
                    <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-none text-gradient mt-1">
                      {slide.subheadline}
                    </h1>
                  </motion.div>

                  {/* Description */}
                  <motion.p variants={textItemVariants} className="text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                    {slide.description}
                  </motion.p>

                  {/* CTAs */}
                  <motion.div variants={textItemVariants} className="flex flex-wrap items-center gap-4">
                    <Link href={slide.cta.href} className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                      {slide.cta.label} <ArrowRight size={18} />
                    </Link>
                    <Link href="/products" className="btn-ghost text-base">
                      Browse All →
                    </Link>
                  </motion.div>

                  {/* Feature pills */}
                  <motion.div variants={textItemVariants} className="flex flex-wrap gap-3 pt-2">
                    {features.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-1.5 px-3 py-1.5
                                                 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full">
                        <Icon size={12} className="text-primary-600 dark:text-primary-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{label}</span>
                      </div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Visual side */}
                <div className="hidden lg:flex items-center justify-center relative h-full w-full">
                  <motion.div
                    custom={direction}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="relative w-full h-[400px] flex items-center justify-center"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Glow ring */}
                    <div
                      className="absolute inset-0 rounded-full blur-3xl opacity-30 scale-90 transition-colors duration-1000"
                      style={{ background: `radial-gradient(circle, ${slide.accent}, transparent)` }}
                    />

                    {/* Main image */}
                    <div
                      className="relative w-80 h-80 rounded-[3rem] flex items-center justify-center
                                 glass-card border-2 shadow-2xl overflow-hidden"
                      style={{ borderColor: `${slide.accent}40` }}
                    >
                      <Image 
                        src={slide.image} 
                        alt={slide.headline} 
                        fill 
                        className="object-cover"
                        unoptimized={slide.image.startsWith('http')} // needed for external unsplash URLs
                      />
                      {(slide as any).overlayOpacity !== undefined && (
                        <div className="absolute inset-0 bg-black" style={{ opacity: (slide as any).overlayOpacity }} />
                      )}
                    </div>

                    {/* Floating badges - fixed relative to the 3D rotating parent */}
                    <motion.div
                      animate={{ x: [0, 8, 0], y: [0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -top-4 -right-2 glass-card px-3 py-2 shadow-glow-primary z-20"
                    >
                      <p className="text-xs text-gray-600 dark:text-gray-400">Starting from</p>
                      <p className="font-display font-bold text-primary-400">₹999</p>
                    </motion.div>

                    <motion.div
                      animate={{ x: [0, -5, 0], y: [0, 5, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                      className="absolute -bottom-4 -left-2 glass-card px-3 py-2 shadow-glow-cyan z-20"
                    >
                      <p className="text-xs text-gray-600 dark:text-gray-400">Free Shipping</p>
                      <p className="font-display font-bold text-cyan-400 text-sm">All Orders ✓</p>
                    </motion.div>
                  </motion.div>
                </div>

              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide controls */}
      <div className="relative pb-10 flex items-center justify-center gap-4 z-20">
        {/* Prev */}
        <button
          onClick={() => paginate(-1)}
          disabled={isAnimating}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center
                     text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:border-primary-400/40 transition-all disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => paginate(idx > current ? 1 : -1, idx)}
              disabled={isAnimating}
              className={`transition-all duration-300 rounded-full disabled:cursor-not-allowed ${
                idx === current
                  ? 'w-8 h-2 bg-primary-400'
                  : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => paginate(1)}
          disabled={isAnimating}
          className="w-9 h-9 rounded-full glass-card flex items-center justify-center
                     text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:border-primary-400/40 transition-all disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
