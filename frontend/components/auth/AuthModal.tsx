'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Zap, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { authApi, getApiError } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AuthModal() {
  const { authModalOpen, authModalMode, pendingCartAction, closeAuthModal, openAuthModal, clearPendingAction } = useUIStore();
  const { setAuth } = useAuthStore();
  const { addItem, fetchCart } = useCartStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'forgot-reset' | 'otp'>(authModalMode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', newPassword: '', otp: '',
  });

  useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeAuthModal]);

  // Prevent body scroll
  useEffect(() => {
    if (authModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [authModalOpen]);

  const updateField = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /** After successful auth, execute the pending cart action */
  const executePendingAction = async () => {
    if (pendingCartAction) {
      await fetchCart();
      await addItem(pendingCartAction.productId, pendingCartAction.qty, pendingCartAction.variantId);
      clearPendingAction();
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setIsLoading(true);
    try {
      const res  = await authApi.login({ email: form.email, password: form.password });
      
      // Check if OTP is required
      if (res.data?.data?.requireOtp) {
        toast.error(res.data.message || 'Please verify your email.');
        setMode('otp');
        setIsLoading(false);
        return;
      }

      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}! 👋`);
      closeAuthModal();
      await executePendingAction();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setIsLoading(true);
    try {
      const res = await authApi.register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      
      if (res.data?.data?.requireOtp) {
        toast.success(res.data.message || 'OTP sent to your email.');
        setMode('otp');
        setIsLoading(false);
        return;
      }

      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome to VoltEdge, ${user.name}! 🎉`);
      closeAuthModal();
      await executePendingAction();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.otp) return toast.error('Please enter the OTP');
    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp({ email: form.email, otp: form.otp });
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome to VoltEdge, ${user.name}! 🎉`);
      closeAuthModal();
      await executePendingAction();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Email is required');
    setIsLoading(true);
    try {
      await authApi.forgotPasswordCheck(forgotEmail);
      setForm((prev) => ({ ...prev, email: forgotEmail }));
      setMode('forgot-reset');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.newPassword) return toast.error('New password is required');
    if (form.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.newPassword !== form.confirmPassword) return toast.error('Passwords do not match');
    setIsLoading(true);
    try {
      await authApi.forgotPasswordReset(forgotEmail, form.newPassword);
      toast.success('Password reset! Please log in with your new password.');
      setMode('login');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card w-full max-w-md overflow-hidden shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Zap size={16} className="text-white" fill="white" />
                  </div>
                  <span className="font-display font-bold text-lg text-white">VoltEdge</span>
                </div>
                <button onClick={closeAuthModal} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* Pending action notice */}
              {pendingCartAction && (
                <div className="mx-6 mt-4 px-4 py-2 bg-primary-400/10 border border-primary-400/30 rounded-xl">
                  <p className="text-xs text-primary-400 font-medium text-center">
                    🛒 Sign in to add this item to your cart — it will be added automatically!
                  </p>
                </div>
              )}

              {/* ─── Login ─────────────────────────────────────────── */}
              {mode === 'login' && (
                <div className="px-6 py-6">
                  <h2 className="font-display font-bold text-2xl text-white mb-1">Welcome back</h2>
                  <p className="text-sm text-gray-400 mb-6">Sign in to your VoltEdge account</p>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <InputField icon={<Mail size={16} />} type="email" placeholder="Email address"
                      value={form.email} onChange={(v) => updateField('email', v)} />
                    <InputField icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'}
                      placeholder="Password" value={form.password} onChange={(v) => updateField('password', v)}
                      suffix={
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-white transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                    <div className="text-right">
                      <button type="button" onClick={() => setMode('forgot')}
                        className="text-xs text-primary-400 hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <button type="submit" disabled={isLoading}
                      className="btn-primary w-full flex items-center justify-center gap-2">
                      {isLoading ? <Spinner /> : 'Sign In'}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-400 mt-5">
                    Don&apos;t have an account?{' '}
                    <button onClick={() => setMode('register')} className="text-primary-400 font-medium hover:underline">
                      Create one
                    </button>
                  </p>
                </div>
              )}

              {/* ─── Register ──────────────────────────────────────── */}
              {mode === 'register' && (
                <div className="px-6 py-6">
                  <h2 className="font-display font-bold text-2xl text-white mb-1">Create account</h2>
                  <p className="text-sm text-gray-400 mb-6">Join VoltEdge for the best deals</p>

                  <form onSubmit={handleRegister} className="space-y-3">
                    <InputField icon={<User size={16} />} type="text" placeholder="Full name"
                      value={form.name} onChange={(v) => updateField('name', v)} />
                    <InputField icon={<Mail size={16} />} type="email" placeholder="Email address"
                      value={form.email} onChange={(v) => updateField('email', v)} />
                    <InputField icon={<Phone size={16} />} type="tel" placeholder="Phone (optional)"
                      value={form.phone} onChange={(v) => updateField('phone', v)} />
                    <InputField icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'}
                      placeholder="Password (min 6 chars)" value={form.password} onChange={(v) => updateField('password', v)}
                      suffix={
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-white transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                    <InputField icon={<Lock size={16} />} type="password" placeholder="Confirm password"
                      value={form.confirmPassword} onChange={(v) => updateField('confirmPassword', v)} />
                    <button type="submit" disabled={isLoading}
                      className="btn-primary w-full flex items-center justify-center gap-2">
                      {isLoading ? <Spinner /> : 'Create Account'}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-400 mt-4">
                    Already have an account?{' '}
                    <button onClick={() => setMode('login')} className="text-primary-400 font-medium hover:underline">
                      Sign in
                    </button>
                  </p>
                </div>
              )}

              {/* ─── Verify OTP ─────────────────────────────────────── */}
              {mode === 'otp' && (
                <div className="px-6 py-6">
                  <button onClick={() => setMode('login')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft size={14} /> Back to login
                  </button>
                  <h2 className="font-display font-bold text-2xl text-white mb-1">Verify your email</h2>
                  <p className="text-sm text-gray-400 mb-6">Enter the 6-digit code sent to <span className="text-white">{form.email}</span></p>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <InputField icon={<Mail size={16} />} type="text" placeholder="6-digit OTP code"
                      value={form.otp} onChange={(v) => updateField('otp', v)} />
                    <button type="submit" disabled={isLoading}
                      className="btn-primary w-full flex items-center justify-center gap-2">
                      {isLoading ? <Spinner /> : 'Verify & Login'}
                    </button>
                  </form>
                </div>
              )}

              {/* ─── Forgot — step 1 ──────────────────────────────── */}
              {mode === 'forgot' && (
                <div className="px-6 py-6">
                  <button onClick={() => setMode('login')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft size={14} /> Back to login
                  </button>
                  <h2 className="font-display font-bold text-2xl text-white mb-1">Forgot password?</h2>
                  <p className="text-sm text-gray-400 mb-6">Enter your email to reset your password</p>

                  <form onSubmit={handleForgotCheck} className="space-y-4">
                    <InputField icon={<Mail size={16} />} type="email" placeholder="Your registered email"
                      value={forgotEmail} onChange={setForgotEmail} />
                    <button type="submit" disabled={isLoading}
                      className="btn-primary w-full flex items-center justify-center gap-2">
                      {isLoading ? <Spinner /> : 'Continue'}
                    </button>
                  </form>
                </div>
              )}

              {/* ─── Forgot — step 2 (new password) ─────────────────── */}
              {mode === 'forgot-reset' && (
                <div className="px-6 py-6">
                  <h2 className="font-display font-bold text-2xl text-white mb-1">Set new password</h2>
                  <p className="text-sm text-gray-400 mb-6">Enter and confirm your new password</p>

                  <form onSubmit={handleForgotReset} className="space-y-4">
                    <InputField icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'}
                      placeholder="New password" value={form.newPassword} onChange={(v) => updateField('newPassword', v)}
                      suffix={
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-white transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                    <InputField icon={<Lock size={16} />} type="password" placeholder="Confirm new password"
                      value={form.confirmPassword} onChange={(v) => updateField('confirmPassword', v)} />
                    <button type="submit" disabled={isLoading}
                      className="btn-primary w-full flex items-center justify-center gap-2">
                      {isLoading ? <Spinner /> : 'Reset Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* Mode tabs */}
              {(mode === 'login' || mode === 'register') && (
                <div className="flex border-t border-primary-400/10">
                  {(['login', 'register'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-3 text-sm font-medium transition-all ${
                        mode === m
                          ? 'text-primary-400 border-t-2 border-primary-400 -mt-px'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {m === 'login' ? 'Sign In' : 'Register'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InputField({
  icon, type, placeholder, value, onChange, suffix,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 text-gray-400 pointer-events-none">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field pl-10 pr-10"
        autoComplete={type === 'password' ? 'current-password' : undefined}
      />
      {suffix && (
        <div className="absolute right-3 flex items-center">{suffix}</div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
