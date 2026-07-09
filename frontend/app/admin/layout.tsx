'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  Image as ImageIcon,
  LogOut,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

const adminLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Orders', href: '/admin/orders', icon: Package },
  { name: 'Finance', href: '/admin/finance', icon: DollarSign },
  { name: 'Content', href: '/admin/content', icon: ImageIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!user) {
        router.replace('/');
      } else if (user.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [user, isMounted, router]);

  if (!isMounted || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex overflow-hidden font-sans selection:bg-primary-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-800">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide">Admin Portal</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {adminLinks.map((link) => {
            const isActive =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                  isActive
                    ? 'text-white bg-primary-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-y-0 left-0 w-1 bg-primary-500 rounded-r-full"
                  />
                )}
                <link.icon size={18} className={isActive ? 'text-primary-500' : ''} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-primary-400 font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-gray-950 border-b border-gray-800/50 shrink-0 z-10">
          <h1 className="text-xl font-medium text-white capitalize">
            {pathname === '/admin'
              ? 'Dashboard'
              : pathname.split('/')[2] || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              View Live Store ↗
            </Link>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-gray-950 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
