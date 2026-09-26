'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { signupErrorMessage, validatePassword, passwordIssues, isValidEmail, isAdminEmail, ADMIN_ONLY_SIGN_IN } from '../../lib/auth';
import OtpVerificationCard from './OtpVerificationCard';

function SignupCard() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.email && !isValidEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    // The admin account already exists and must never be created from here.
    if (isAdminEmail(form.email)) {
      setError(ADMIN_ONLY_SIGN_IN);
      return;
    }
    if (form.password && form.password.length < 8) {
      setError(validatePassword(form.password) || 'Password must be at least 8 characters');
      return;
    }
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name, phone: form.phone || null },
        },
      });
      if (authError) throw authError;
      if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists');
        return;
      }
      setOtpStep(true);
    } catch (err) {
      setError(signupErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const pwdIssues = form.password ? passwordIssues(form.password) : [];

  if (otpStep) {
    return (
      <OtpVerificationCard
        email={form.email}
        successHref="/"
        backHref="/login"
        backLabel="Back to sign in"
      />
    );
  }

  return (
    <div className="auth-shell flex min-h-screen items-center bg-white pt-24 sm:pt-28">
      <div className="grid min-h-[calc(100vh-7rem)] w-full items-stretch lg:grid-cols-12">
        <div className="relative hidden overflow-hidden bg-neutral-100 lg:col-span-5 lg:block">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"
            alt="Customer creating a Core Collective account"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-col justify-center px-6 py-12 sm:px-12 lg:col-span-7 lg:px-16">
          <div className="mb-8 text-center sm:text-left">
            <span className="auth-brand">Core Collective</span>
            <span className="auth-eyebrow">B2B Wholesale Marketplace</span>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Access wholesale pricing and manage your business purchases.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="auth-label">Full name</label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="First and last name"
                  autoComplete="name"
                  required
                  className="auth-input"
                />
              </div>

              <div>
                <label htmlFor="phone" className="auth-label">Phone number <span className="font-normal text-gray-400">(optional)</span></label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+92 300 0000000"
                  autoComplete="tel"
                  className="auth-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="auth-label">Email address</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@company.com"
                autoComplete="email"
                required
                className="auth-input"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="auth-label">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
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

              <div>
                <label htmlFor="confirmPassword" className="auth-label">Confirm password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                    className="auth-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-black"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {pwdIssues.length > 0 && (
              <p className="text-[13px] leading-5 text-red-600">Password must include {pwdIssues.join(', ')}.</p>
            )}

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button type="submit" disabled={loading} className="auth-button mt-1">
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="auth-navigation">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-black hover:underline">
                Sign in
              </Link>
            </p>
            <p>
              Are you a supplier?{' '}
              <Link href="/supplier/signup" className="font-semibold text-black hover:underline">
                Register your business
              </Link>
            </p>
          </div>

          <div className="auth-footer">By continuing, you agree to our terms and privacy policy</div>
        </div>
      </div>
    </div>
  );
}

export default SignupCard;
