'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isValidEmail, loginErrorMessage } from '../../lib/auth';

const REMEMBER_KEY = 'corecollective_remember_email';

function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      if (rememberMe) {
        try { localStorage.setItem(REMEMBER_KEY, email); } catch {}
      } else {
        try { localStorage.removeItem(REMEMBER_KEY); } catch {}
      }

      if (user) {
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
      }
      if (user?.email === 'hinata4020196@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell flex min-h-screen items-center bg-white pt-24 sm:pt-28">
      <div className="grid min-h-[calc(100vh-7rem)] w-full items-stretch lg:grid-cols-12">
        <div className="relative hidden overflow-hidden bg-neutral-100 lg:col-span-6 lg:block">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
            alt="Customer signing in to Core Collective"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto flex w-full max-w-xl flex-col justify-center px-6 py-12 sm:px-12 lg:col-span-6 lg:px-16">
          <div className="mb-8 text-center sm:text-left">
            <span className="auth-brand">Core Collective</span>
            <span className="auth-eyebrow">B2B Wholesale Marketplace</span>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to access your buyer account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="auth-label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                className="auth-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="auth-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="auth-input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-black focus-visible:text-black"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2.5 pt-1 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-[18px] w-[18px] rounded accent-black"
              />
              <span>Remember me</span>
            </label>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button type="submit" disabled={loading} className="auth-button mt-1">
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-navigation">
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-black hover:underline">
                Create an account
              </Link>
            </p>
            <p>
              Are you a supplier?{' '}
              <Link href="/supplier/login" className="font-semibold text-black hover:underline">
                Supplier login
              </Link>
            </p>
          </div>

          <div className="auth-footer">Secure business account access</div>
        </div>
      </div>
    </div>
  );
}

export default LoginCard;