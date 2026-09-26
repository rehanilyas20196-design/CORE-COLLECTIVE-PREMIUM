'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader,
  Lock,
  Mail,
  PackageCheck,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import {
  isValidEmail,
  loginErrorMessage,
  passwordIssues,
  signupErrorMessage,
  validatePassword,
} from '../../lib/auth';

const ADMIN_EMAIL = 'hinata4020196@gmail.com';
const ADMIN_ACCESS_ERROR = 'This account does not have administrator access.';

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function isAdminAccount(user) {
  return normalizeEmail(user?.email || '') === ADMIN_EMAIL;
}

function adminLoginErrorMessage(error) {
  if (error?.message === ADMIN_ACCESS_ERROR) return error.message;
  const message = error?.message || '';
  if (/ADMIN_PASSWORD|Server not configured for admin operations/i.test(message)) {
    return 'Admin access is not configured yet. Initialize the admin account first.';
  }
  return loginErrorMessage(error);
}

function adminSignupErrorMessage(error) {
  const message = error?.message || '';
  if (/ADMIN_PASSWORD|Server not configured for admin operations/i.test(message)) {
    return 'Admin signup is not configured on the server yet.';
  }
  return signupErrorMessage(error);
}

function AuthField({ id, label, icon: Icon, error, action, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="auth-label">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          id={id}
          className={`auth-input pl-12 ${error ? 'border-red-300 focus:border-red-500' : ''} ${action ? 'pr-12' : ''}`}
          aria-invalid={error ? 'true' : undefined}
          {...inputProps}
        />
        {action}
      </div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, visible, onToggle, autoComplete, error }) {
  return (
    <AuthField
      id={id}
      label={label}
      icon={Lock}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      required
      error={error}
      action={(
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-black focus-visible:text-black"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
    />
  );
}

function AdminAuthPanel({ mode }) {
  const features = [
    { icon: BarChart3, text: 'Monitor marketplace performance' },
    { icon: PackageCheck, text: 'Review products and supplier requests' },
    { icon: Users, text: 'Manage customers, orders, and inquiries' },
  ];

  return (
    <aside className="relative hidden overflow-hidden bg-black px-12 py-14 text-white lg:col-span-5 lg:flex lg:flex-col lg:justify-between xl:px-16">
      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-white/[0.06] blur-[90px]" />
      <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-white/[0.04] blur-[110px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="relative z-10">
        <span className="font-playfair text-[22px] font-bold uppercase leading-[1.15] tracking-[0.13em] text-white">
          Core Collective
        </span>
      </div>

      <div className="relative z-10 max-w-lg">
        <span className="mb-7 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.06]">
          <ShieldCheck className="h-7 w-7 text-white" strokeWidth={1.6} />
        </span>
        <span className="auth-image-kicker">Protected administration</span>
        <h2 className="auth-image-title max-w-md">
          {mode === 'signup' ? 'Initialize your admin workspace.' : 'Run the marketplace with clarity.'}
        </h2>
        <p className="mt-6 max-w-md text-sm leading-7 text-neutral-400">
          A focused workspace for the people, products, and operations that keep Core Collective moving.
        </p>

        <div className="mt-10 space-y-4">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-neutral-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Secure admin workspace
      </div>
    </aside>
  );
}

export default function AdminLoginCard({ initialMode = 'login' }) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const mode = initialMode === 'signup' ? 'signup' : 'login';
  const [login, setLogin] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ email: '', password: '', confirmPassword: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const completeSignIn = async (user) => {
    if (!isAdminAccount(user)) {
      await supabase.auth.signOut({ scope: 'local' });
      throw new Error(ADMIN_ACCESS_ERROR);
    }
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
    router.replace('/admin');
    router.refresh();
  };

  const signIn = async (email, password) => {
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;
    return data.user;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    const email = normalizeEmail(login.email);
    const password = login.password;
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
      let user;
      try {
        user = await signIn(email, password);
      } catch (authError) {
        if (!/invalid.*credential|email not confirmed/i.test(authError.message || '')) throw authError;
        await api.auth.ensureAdmin();
        user = await signIn(email, password);
      }
      await completeSignIn(user);
    } catch (authError) {
      setError(adminLoginErrorMessage(authError));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError('');

    const email = normalizeEmail(signup.email);
    const password = signup.password;
    if (!email || !password || !signup.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== signup.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.auth.ensureAdmin();
      const user = await signIn(email, password);
      await completeSignIn(user);
    } catch (signupError) {
      if (signupError.message === ADMIN_ACCESS_ERROR) {
        setError(ADMIN_ACCESS_ERROR);
      } else if (/Invalid login credentials|user not found|email not confirmed/i.test(signupError.message || '')) {
        setError('Use the administrator email and password configured on the server.');
      } else {
        setError(adminSignupErrorMessage(signupError));
      }
    } finally {
      setLoading(false);
    }
  };

  const signupPasswordIssues = signup.password ? passwordIssues(signup.password) : [];

  return (
    <div className="auth-shell flex min-h-screen items-center bg-white pt-24 sm:pt-28">
      <div className="grid min-h-[calc(100vh-7rem)] w-full items-stretch lg:grid-cols-12">
        <AdminAuthPanel mode={mode} />

        <main className={`mx-auto flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 ${mode === 'signup' ? 'max-w-2xl lg:col-span-7' : 'max-w-xl lg:col-span-7'}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {mode === 'login' ? (
                <>
                  <div className="mb-8 text-center sm:text-left">
                    <span className="auth-brand">Core Collective</span>
                    <span className="auth-eyebrow">Admin workspace</span>
                    <h1 className="auth-title">Admin sign in</h1>
                    <p className="auth-subtitle">Access the protected marketplace administration dashboard.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5" noValidate>
                    <AuthField
                      id="admin-email"
                      label="Email address"
                      icon={Mail}
                      type="email"
                      value={login.email}
                      onChange={(event) => setLogin((current) => ({ ...current, email: event.target.value }))}
                      placeholder="admin@company.com"
                      autoComplete="email"
                      required
                    />

                    <PasswordField
                      id="admin-password"
                      label="Password"
                      value={login.password}
                      onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))}
                      visible={showLoginPassword}
                      onToggle={() => setShowLoginPassword((current) => !current)}
                      autoComplete="current-password"
                    />

                    {error && <div className="auth-error" role="alert">{error}</div>}

                    <button type="submit" disabled={loading} className="auth-button mt-1" aria-busy={loading}>
                      {loading ? <Loader className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      {loading ? 'Signing in…' : 'Sign in to admin panel'}
                    </button>
                  </form>

                  <div className="auth-navigation">
                    <p>
                      Need to initialize admin access?{' '}
                      <Link href="/admin/signup" className="font-semibold text-black hover:underline">
                        Admin signup
                      </Link>
                    </p>
                    <p>
                      Looking for customer access?{' '}
                      <Link href="/login" className="font-semibold text-black hover:underline">
                        Back to user login
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-8 text-center sm:text-left">
                    <span className="auth-brand">Core Collective</span>
                    <span className="auth-eyebrow">Initial admin setup</span>
                    <h1 className="auth-title">Create admin access</h1>
                    <p className="auth-subtitle">Initialize the administrator account configured by the backend.</p>
                  </div>

                  <div className="mb-6 rounded-xl border border-gray-200 bg-[#FAF9F6] p-4 text-sm leading-6 text-gray-600">
                    <span className="font-semibold text-black">Protected setup.</span>{' '}
                    This activates only the server-configured administrator. It does not create additional privileged accounts.
                  </div>

                  <form onSubmit={handleSignup} className="space-y-5" noValidate>
                    <AuthField
                      id="admin-signup-email"
                      label="Administrator email"
                      icon={Mail}
                      type="email"
                      value={signup.email}
                      onChange={(event) => setSignup((current) => ({ ...current, email: event.target.value }))}
                      placeholder="admin@company.com"
                      autoComplete="email"
                      required
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <PasswordField
                        id="admin-signup-password"
                        label="Password"
                        value={signup.password}
                        onChange={(event) => setSignup((current) => ({ ...current, password: event.target.value }))}
                        visible={showSignupPassword}
                        onToggle={() => setShowSignupPassword((current) => !current)}
                        autoComplete="new-password"
                      />

                      <PasswordField
                        id="admin-signup-confirm-password"
                        label="Confirm password"
                        value={signup.confirmPassword}
                        onChange={(event) => setSignup((current) => ({ ...current, confirmPassword: event.target.value }))}
                        visible={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword((current) => !current)}
                        autoComplete="new-password"
                      />
                    </div>

                    {signupPasswordIssues.length > 0 && (
                      <p className="text-[13px] leading-5 text-red-600">
                        Password must include {signupPasswordIssues.join(', ')}.
                      </p>
                    )}

                    {error && <div className="auth-error" role="alert">{error}</div>}

                    <button type="submit" disabled={loading} className="auth-button mt-1" aria-busy={loading}>
                      {loading ? <Loader className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      {loading ? 'Creating admin access…' : 'Create admin access'}
                    </button>
                  </form>

                  <div className="auth-navigation">
                    <p>
                      Already initialized?{' '}
                      <Link href="/admin" className="font-semibold text-black hover:underline">
                        Admin login
                      </Link>
                    </p>
                    <p>
                      Customer account?{' '}
                      <Link href="/login" className="font-semibold text-black hover:underline">
                        Back to user login
                      </Link>
                    </p>
                  </div>
                </>
              )}

              <div className="auth-footer">Restricted administrator workspace</div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
