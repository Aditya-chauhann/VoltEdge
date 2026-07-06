'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function NewsletterBanner() {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden glass-card p-8 md:p-12 text-center
                        bg-gradient-to-br from-primary-900/30 to-cyan-900/20">

          {/* Background decorations */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Icon */}
          <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail size={26} className="text-white" />
          </div>

          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">
            Stay in the Loop
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Get exclusive deals, new arrivals, and tech tips delivered straight to your inbox.
            Join 50,000+ gadget lovers!
          </p>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-2 text-success font-medium"
            >
              <CheckCircle size={20} />
              You&apos;re subscribed! Check your inbox.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary flex items-center justify-center gap-2 flex-shrink-0">
                Subscribe <ArrowRight size={16} />
              </button>
            </form>
          )}

          <p className="text-xs text-gray-500 mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
