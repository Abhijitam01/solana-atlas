'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock } from 'lucide-react';
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void; // Optional if not implemented
}

export function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onClose();
      // AuthProvider handles state update via onAuthStateChange
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 pointer-events-auto"
          >
            <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
                <p className="text-white/60">Sign in to your account</p>
              </div>
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#14F195] transition-colors text-white"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#14F195] transition-colors text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#14F195] to-[#00D18C] text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" text="Loading..." className="text-black/70" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-white/40">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                {/* SVG icon for Google */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
              {onSwitchToSignup && (
                <p className="text-center text-sm text-white/60 mt-6">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={onSwitchToSignup}
                    className="text-[#14F195] hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
