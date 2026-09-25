'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isValidEmail, loginErrorMessage } from '../../lib/auth';

function SupplierLoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (user) {
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
      }
      router.push('/supplier/dashboard');
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
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
            alt="Supplier storefront managed through Core Collective"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-10 lg:p-14">
            <p className="auth-image-kicker">Supplier portal</p>
            <h2 className="auth-image-title max-w-lg">Grow your business with Core Collective</h2>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-xl flex-col justify-center px-6 py-12 sm:px-12 lg:col-span-6 lg:px-16">
          <div className="mb-8 text-center sm:text-left">
            <span className="auth-brand">Core Collective</span>
            <span className="auth-eyebrow">Supplier Network</span>
            <h1 className="auth-title">Supplier sign in</h1>
            <p className="auth-subtitle">Access your products, orders, and business dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label htmlFor="supplier-email" className="auth-label">Business email address</label>
              <input
                id="supplier-email"
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
              <label htmlFor="supplier-password" className="auth-label">Password</label>
              <div className="relative">
                <input
                  id="supplier-password"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-black"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button type="submit" disabled={loading} className="auth-button mt-1">
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in to supplier portal'}
            </button>
          </form>

          <div className="auth-navigation">
            <p>
              New to the supplier network?{' '}
              <Link href="/supplier/signup" className="font-semibold text-black hover:underline">
                Create a supplier account
              </Link>
            </p>
            <p>
              Shopping as a buyer?{' '}
              <Link href="/login" className="font-semibold text-black hover:underline">
                Customer sign in
              </Link>
            </p>
          </div>

          <div className="auth-footer">Verified supplier network access</div>
        </div>
      </div>
    </div>
  );
}

export default SupplierLoginCard;
