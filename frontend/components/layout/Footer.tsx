'use client';

import Link from 'next/link';
import { Zap, Mail, Phone, MapPin, Instagram, Twitter, Youtube, Facebook } from 'lucide-react';

const categories = [
  { name: 'Accessories',       href: '/category/accessories-parts' },
  { name: 'Home Audio',        href: '/category/home-audio-video' },
  { name: 'Smart Electronics', href: '/category/smart-electronics' },
  { name: 'Cameras',           href: '/category/camera-photo' },
  { name: 'Video Games',       href: '/category/video-games' },
  { name: 'Portable Audio',    href: '/category/portable-audio-video' },
];

const support = [
  { name: 'My Orders',     href: '/account/orders' },
  { name: 'Returns',       href: '/account/orders' },
  { name: 'Track Order',   href: '/account/orders' },
  { name: 'Contact Us',    href: 'mailto:support@voltedge.in' },
];

const legal = [
  { name: 'Privacy Policy',    href: '#' },
  { name: 'Terms of Service',  href: '#' },
  { name: 'Refund Policy',     href: '#' },
  { name: 'Shipping Policy',   href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-base-50 border-t border-primary-400/10 mt-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Volt<span className="text-gradient">Edge</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              India&apos;s premium electronics store. Latest gadgets, smartest prices.
            </p>
            <div className="flex flex-col gap-2">
              <a href="mailto:support@voltedge.in" className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors">
                <Mail size={14} /> support@voltedge.in
              </a>
              <a href="tel:+918001234567" className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors">
                <Phone size={14} /> +91 800 123 4567
              </a>
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin size={14} /> Bengaluru, Karnataka, India
              </p>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Instagram, label: 'Instagram', href: '#' },
                { icon: Twitter,   label: 'Twitter',   href: '#' },
                { icon: Youtube,   label: 'YouTube',   href: '#' },
                { icon: Facebook,  label: 'Facebook',  href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 glass-card flex items-center justify-center
                             text-gray-400 hover:text-primary-400 hover:border-primary-400/40
                             transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.name}>
                  <Link href={c.href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2.5">
              {support.map((s) => (
                <li key={s.name}>
                  <Link href={s.href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {legal.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-400/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} VoltEdge. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Payment badges */}
            <div className="flex items-center gap-2">
              {['Razorpay', 'UPI', 'Visa', 'Mastercard', 'COD'].map((p) => (
                <span
                  key={p}
                  className="text-xs px-2 py-1 bg-base-100 border border-primary-400/10 rounded text-gray-400"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
