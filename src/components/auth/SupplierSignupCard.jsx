'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { signupErrorMessage, validatePassword, passwordIssues, isValidEmail, isAdminEmail, ADMIN_ONLY_SIGN_IN } from '../../lib/auth';
import OtpVerificationCard from './OtpVerificationCard';

function Field({ id, label, required, optional, toggle, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="auth-label">
        {label}
        {required && <span className="text-black"> *</span>}
        {optional && <span className="text-[11px] font-normal text-gray-400"> (optional)</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          {...inputProps}
          required={required}
          className={`auth-input ${toggle ? 'pr-12' : ''}`}
        />
        {toggle && (
          <button
            type="button"
            onClick={toggle.onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-black"
            aria-label={toggle.shown ? 'Hide password' : 'Show password'}
          >
            {toggle.shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div>
      <h3 className="auth-section-label">{children}</h3>
      <div className="mt-2 h-px w-full bg-gray-200" />
    </div>
  );
}

function SupplierSignupCard() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    companyName: '', companyWebsite: '', businessType: '', productCategories: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.email || !form.password || !form.companyName) {
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
          data: {
            full_name: form.name,
            phone: form.phone || null,
            company_name: form.companyName,
            company_website: form.companyWebsite || null,
            business_type: form.businessType || null,
            product_categories: form.productCategories || null,
            role: 'supplier',
            is_supplier: true,
          },
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

  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));
  const pwdIssues = useMemo(() => (form.password ? passwordIssues(form.password) : []), [form.password]);

  if (otpStep) {
    return (
      <OtpVerificationCard
        email={form.email}
        successHref="/supplier/dashboard"
        backHref="/supplier/login"
        backLabel="Back to supplier sign in"
        title="Verify your email"
        subtext={
          <>
            Enter the 6-digit code sent to <span className="font-semibold text-black">{form.email}</span> to confirm your supplier account. After verification, our team will review your application within 48 hours.
          </>
        }
        successTitle="Email verified!"
        successText="Your supplier account is confirmed. Taking you to your supplier dashboard…"
      />
    );
  }

  return (
    <div className="auth-shell flex min-h-screen items-center bg-white pt-24 sm:pt-28">
      <div className="grid min-h-[calc(100vh-7rem)] w-full items-stretch lg:grid-cols-12">
        <div className="relative hidden overflow-hidden bg-neutral-100 lg:col-span-5 lg:block">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop"
            alt="Furniture supplier collection"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-10 lg:p-12">
            <p className="auth-image-kicker">Supplier network</p>
            <h2 className="auth-image-title">Grow your business with us</h2>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col justify-center px-6 py-12 sm:px-12 lg:col-span-7 lg:px-16">
          <div className="mb-8 text-center sm:text-left">
            <span className="auth-brand">Core Collective</span>
            <span className="auth-eyebrow">Supplier Network</span>
            <h1 className="auth-title">Supplier registration</h1>
            <p className="auth-subtitle">Tell us about your business and join our verified supplier network.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5" noValidate>
            <SectionLabel>Personal information</SectionLabel>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="supplier-name"
                label="Full name"
                required
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="First and last name"
                autoComplete="name"
              />
              <Field
                id="supplier-phone"
                label="Phone number"
                required
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+92 300 0000000"
                autoComplete="tel"
              />
            </div>

            <Field
              id="supplier-email"
              label="Business email address"
              required
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@company.com"
              autoComplete="email"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="supplier-password"
                label="Password"
                required
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                toggle={{ shown: showPassword, onToggle: () => setShowPassword(!showPassword) }}
              />
              <Field
                id="supplier-confirm-password"
                label="Confirm password"
                required
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Repeat your password"
                autoComplete="new-password"
                toggle={{
                  shown: showConfirmPassword,
                  onToggle: () => setShowConfirmPassword(!showConfirmPassword),
                }}
              />
            </div>

            {pwdIssues.length > 0 && (
              <p className="text-[13px] leading-5 text-red-600">Password must include {pwdIssues.join(', ')}.</p>
            )}

            <div className="pt-2">
              <SectionLabel>Business details</SectionLabel>
            </div>

            <Field
              id="supplier-company"
              label="Company name"
              required
              type="text"
              value={form.companyName}
              onChange={set('companyName')}
              placeholder="Your company Ltd."
              autoComplete="organization"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="supplier-website"
                label="Company website"
                optional
                type="url"
                value={form.companyWebsite}
                onChange={set('companyWebsite')}
                placeholder="https://example.com"
                autoComplete="url"
              />
              <Field
                id="supplier-business-type"
                label="Business type"
                optional
                type="text"
                value={form.businessType}
                onChange={set('businessType')}
                placeholder="Manufacturer or distributor"
              />
            </div>

            <Field
              id="supplier-categories"
              label="Product categories"
              optional
              type="text"
              value={form.productCategories}
              onChange={set('productCategories')}
              placeholder="Electronics, clothing, furniture"
            />

            {error && <div className="auth-error" role="alert">{error}</div>}

            <p className="text-[13px] leading-5 text-gray-500">
              By registering, you agree to our{' '}
              <Link href="/terms" className="font-semibold text-black underline underline-offset-2">
                terms of service
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="font-semibold text-black underline underline-offset-2">
                supplier agreement
              </Link>
              .
            </p>

            <button type="submit" disabled={loading} className="auth-button mt-1">
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              {loading ? 'Submitting application…' : 'Submit supplier application'}
            </button>
          </form>

          <div className="auth-navigation">
            <p>
              Already registered?{' '}
              <Link href="/supplier/login" className="font-semibold text-black hover:underline">
                Supplier sign in
              </Link>
            </p>
            <p>
              Buying instead of selling?{' '}
              <Link href="/signup" className="font-semibold text-black hover:underline">
                Create a customer account
              </Link>
            </p>
          </div>

          <div className="auth-footer">Supplier applications are reviewed within 48 hours</div>
        </div>
      </div>
    </div>
  );
}

export default SupplierSignupCard;
