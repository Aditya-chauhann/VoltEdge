'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { ordersApi, getApiError } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState('');
  const { fetchCart } = useCartStore();

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('No session ID found.');
      return;
    }

    const verify = async () => {
      try {
        const res = await ordersApi.verifyStripeCheckout({ sessionId });
        setStatus('success');
        setOrderId(res.data.data.orderId);
        fetchCart(); // cart was cleared by backend, fetch to sync UI
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(getApiError(err) || 'Payment verification failed');
      }
    };

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 size={48} className="text-primary-500 animate-spin" />
        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
          Verifying your payment...
        </h2>
        <p className="text-gray-500">Please don't close this page.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
        <XCircle size={64} className="text-red-500" />
        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
          Payment Failed
        </h2>
        <p className="text-gray-500 max-w-md">{errorMsg}</p>
        <Link href="/checkout" className="btn-primary mt-4">
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
      <CheckCircle2 size={64} className="text-green-500" />
      <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white">
        Payment Successful!
      </h2>
      <p className="text-gray-500 max-w-md">
        Thank you for your order. We have received your payment and are processing it now.
      </p>
      <div className="flex gap-4 mt-6">
        <Link href={`/account/orders/${orderId}`} className="btn-primary">
          View Order Details
        </Link>
        <Link href="/products" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <Suspense fallback={
        <div className="flex justify-center py-32">
          <Loader2 size={48} className="text-primary-500 animate-spin" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
