'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, Search, Menu, X, User,
  LogOut, Package, Settings, ChevronDown, Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useSettingsStore, Currency } from '@/store/settingsStore';
import { productsApi, getApiError } from '@/lib/api';
import { debounce } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface Suggestion {
  id: string;
  title: string;
  image: string;
  price: number;
}

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();

  const { isLoggedIn, user, logout } = useAuthStore();
  const { itemCount, openDrawer }    = useCartStore();
  const { openAuthModal }            = useUIStore();
  const { selectedCurrency, setCurrency, fetchConfig } = useSettingsStore();

  const [isScrolled,      setIsScrolled]      = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [suggestions,     setSuggestions]     = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userMenuOpen,    setUserMenuOpen]    = useState(false);

  const searchRef  = useRef<HTMLDivElement>(null);
  const cartCount  = itemCount();
  const isCheckout = pathname?.startsWith('/checkout');

  // Handle scroll for navbar background
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch config on load
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Autosuggest
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchSuggestions = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) { setSuggestions([]); return; }
      try {
        const res = await productsApi.autosuggest(q);
        setSuggestions(res.data.data.suggestions);
        setShowSuggestions(true);
      } catch { /* noop */ }
    }, 300),
    [],
  );

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchSuggestions(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  const navLinks = [
    { href: '/',          label: 'Home' },
    { href: '/products',  label: 'All Products' },
    { href: '/category/smart-electronics', label: 'Smart Electronics' },
    { href: '/category/camera-photo',      label: 'Cameras' },
    { href: '/category/accessories-parts', label: 'Accessories' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'bg-white dark:bg-[#1A1A2E]/95 backdrop-blur-md shadow-lg border-b border-primary-400/10'
          : 'bg-white dark:bg-[#1A1A2E] border-b border-primary-400/5'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo & Theme Toggle ─────────────────────────────────────── */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-gray-900 dark:text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
                Volt<span className="text-gradient">Edge</span>
              </span>
            </Link>
            <ThemeToggle />
          </div>

          {/* ── Desktop Nav ───────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'text-primary-400 bg-primary-400/10'
                    : 'text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ── Search ────────────────────────────────────── */}
          <div ref={searchRef} className="hidden md:flex relative flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 dark:text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  placeholder="Search phones, laptops, gadgets..."
                  className="w-full bg-white dark:bg-base-50 border border-gray-200 dark:border-primary-400/20 shadow-sm dark:shadow-none rounded-xl pl-9 pr-4 py-2
                             text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none
                             focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30
                             transition-all duration-200"
                />
              </div>
            </form>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full mt-2 w-full glass-card shadow-card overflow-hidden z-50"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        router.push(`/products/${s.id}`);
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary-400/10
                                 transition-colors text-left"
                    >
                      {s.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image} alt={s.title} className="w-8 h-8 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">{s.title}</p>
                        <p className="text-xs text-primary-400">₹{s.price.toLocaleString('en-IN')}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit as unknown as React.MouseEventHandler}
                    className="w-full px-3 py-2 text-sm text-primary-400 hover:bg-primary-400/10
                               transition-colors text-left border-t border-primary-400/10"
                  >
                    Search for &quot;{searchQuery}&quot; →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Actions ───────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Currency Switcher */}
            <select
              value={selectedCurrency}
              onChange={(e) => {
                setCurrency(e.target.value as Currency);
                window.location.reload();
              }}
              className="bg-transparent text-sm font-medium text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="INR" className="text-black">INR (₹)</option>
              <option value="USD" className="text-black">USD ($)</option>
              <option value="EUR" className="text-black">EUR (€)</option>
              <option value="GBP" className="text-black">GBP (£)</option>
              <option value="AED" className="text-black">AED (د.إ)</option>
            </select>

            {/* Wishlist */}
            {isLoggedIn && (
              <Link
                href="/account/wishlist"
                className="relative p-2 rounded-xl text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white hover:bg-white/5 transition-all"
              >
                <Heart size={20} />
              </Link>
            )}

            {/* Cart (hidden during checkout) */}
            {!isCheckout && (
              <button
                onClick={isLoggedIn ? openDrawer : () => openAuthModal('login')}
                className="relative p-2 rounded-xl text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white hover:bg-white/5 transition-all"
                aria-label="Open cart"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-primary rounded-full
                               text-xs font-bold text-gray-900 dark:text-white flex items-center justify-center"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </button>
            )}

            {/* User menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-2 rounded-xl text-gray-600 dark:text-gray-300
                             hover:text-primary-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  <div className="w-7 h-7 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 glass-card shadow-card overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-primary-400/10">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-primary-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/account/orders"   onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                     hover:text-primary-600 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-primary-400/10 transition-colors">
                          <Package size={15} /> My Orders
                        </Link>
                        <Link href="/account/profile"  onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                     hover:text-primary-600 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-primary-400/10 transition-colors">
                          <User size={15} /> Profile
                        </Link>
                        <Link href="/account/wishlist" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                     hover:text-primary-600 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-primary-400/10 transition-colors">
                          <Heart size={15} /> Wishlist
                        </Link>
                        {user?.role === 'admin' && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 dark:text-primary-400
                                       hover:bg-primary-50 dark:hover:bg-primary-400/10 transition-colors">
                            <Settings size={15} /> Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger
                                     hover:bg-danger/10 transition-colors">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="btn-primary py-2 px-4 text-sm"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-primary-400/10 bg-white dark:bg-base-50/95 backdrop-blur-md"
          >
            {/* Mobile search */}
            <div className="px-4 py-3">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 dark:text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Search products..."
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </form>
            </div>

            {/* Mobile nav links */}
            <nav className="px-4 pb-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-primary-400 bg-primary-400/10'
                      : 'text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
