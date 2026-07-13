'use client';

import { useEffect, useState } from 'react';
import { publicApi } from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getPolicy('privacy')
      .then(res => setContent(res.data.data.content))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your privacy is critically important to us.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 policy-content text-gray-600 dark:text-gray-300">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
}
