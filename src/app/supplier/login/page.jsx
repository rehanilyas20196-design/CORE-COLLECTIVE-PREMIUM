'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader, ArrowRight, Store } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function SupplierLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (user) {
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
      }
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Invalid email or password' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <img src="https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/Background/Logo/Core%20Collective%20(1).png" alt="Core Collective" className="h-8 w-auto" />
            </Link>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Store className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Supplier Sign In</h1>
            <p className="text-gray-600 text-sm mt-1">Access your supplier dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{error}</motion.p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Not a supplier yet?{' '}
              <Link href="/supplier/signup" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">Register here</Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors">
              Buyer sign in <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
