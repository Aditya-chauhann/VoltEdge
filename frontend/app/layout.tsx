import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import AuthModal from '@/components/auth/AuthModal';
import StoreProvider from '@/components/layout/StoreProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'VoltEdge — Premium Electronics Store',
    template: '%s | VoltEdge',
  },
  description:
    'Shop the latest electronics gadgets and accessories at VoltEdge. Smartphones, laptops, smartwatches, headphones, and more — delivered fast across India.',
  keywords: ['electronics', 'gadgets', 'smartphones', 'laptops', 'online shopping', 'India'],
  openGraph: {
    type:        'website',
    locale:      'en_IN',
    url:         process.env.NEXT_PUBLIC_APP_URL ?? 'https://voltedge.in',
    siteName:    'VoltEdge',
    title:       'VoltEdge — Premium Electronics Store',
    description: 'Shop the latest electronics at VoltEdge',
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: '#6C63FF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Razorpay checkout script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="bg-base text-white antialiased">
        <StoreProvider>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <AuthModal />
        </StoreProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A2E',
              color:      '#F1F1F1',
              border:     '1px solid rgba(108,99,255,0.3)',
              borderRadius: '0.75rem',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#1A1A2E' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#1A1A2E' },
            },
          }}
        />
      </body>
    </html>
  );
}
