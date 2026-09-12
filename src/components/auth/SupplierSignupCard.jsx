'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Loader, ArrowRight,
  Building2, Globe, Tag, Package, CheckCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const creamBg = '#EFE3C8';
const cardBg = '#FBF5E8';
const ink = '#2B2013';
const tan = '#7A6A4C';
const tanLight = '#A5946E';
const goldSoft = 'rgba(140,105,40,0.28)';
const goldMid = '#B8862E';
const goldDark = '#8A6A1E';
const inputBg = '#FFFCF4';

const glowIn = '0 0 0 3px rgba(217,166,60,0.16), 0 0 20px rgba(217,166,60,0.12)';

const fieldBase = {
  width: '100%',
  paddingLeft: '2.75rem',
  paddingRight: '2.75rem',
  paddingTop: '0.85rem',
  paddingBottom: '0.85rem',
  backgroundColor: inputBg,
  border: `1px solid ${goldSoft}`,
  color: ink,
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
};

function Field({ icon: Icon, label, required, optional, toggle, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  const isPassword = inputProps.type === 'password' || toggle;
  return (
    <div>
      <label className="block text-[0.82rem] font-medium mb-1.5 tracking-wide" style={{ color: tan }}>
        {label}
        {required && <span style={{ color: goldMid }}> *</span>}
        {optional && <span className="text-[0.72rem] font-normal" style={{ color: tanLight }}> (optional)</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: focused ? goldMid : tan }} />
        <input
          {...inputProps}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...fieldBase,
            paddingRight: isPassword ? '3.4rem' : '2.75rem',
            borderColor: focused ? goldMid : goldSoft,
            boxShadow: focused ? glowIn : 'none',
          }}
        />
        {toggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={toggle.onToggle}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: tan }}
            aria-label={toggle.shown ? 'Hide password' : 'Show password'}
          >
            {toggle.shown ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div>
      <h3
        className="font-fraunces text-[0.8rem] font-semibold uppercase tracking-[0.16em]"
        style={{ color: goldMid }}
      >
        {children}
      </h3>
      <div className="mt-2 h-px w-full" style={{ background: `linear-gradient(90deg, rgba(184,134,46,0.45), transparent)` }} />
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
  const [success, setSuccess] = useState(false);

  // --- 3D tilt toward the cursor (gentler: max ~6deg for this taller card) ---
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 120, damping: 18, mass: 0.4 });
  const springY = useSpring(rotateY, { stiffness: 120, damping: 18, mass: 0.4 });
  const tiltX = useTransform(springX, [6, -6], [6, -6]);
  const tiltY = useTransform(springY, [6, -6], [6, -6]);
  const frameRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const px = Math.min(1, Math.max(-1, (e.clientX - cx) / (rect.width / 2)));
      const py = Math.min(1, Math.max(-1, (e.clientY - cy) / (rect.height / 2)));
      rotateY.set(px * 6);
      rotateX.set(-py * 6);
    },
    [rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.email || !form.password || !form.companyName) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
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
      if (data?.user?.identities?.length === 0) { setError('An account with this email already exists'); return; }
      setSuccess(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('An account with this email already exists');
      } else if (msg.includes('Database error')) {
        setError('Signup failed due to a database configuration issue. Please run the trigger fix SQL in your Supabase dashboard (see fix_trigger.sql file).');
      } else {
        setError(msg || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  if (success) {
    return (
      <div
        className="relative w-full overflow-hidden flex items-center justify-center min-h-screen pt-[84px] sm:pt-[96px] md:pt-[100px] pb-12"
        style={{ backgroundColor: creamBg }}
      >
        {/* soft radial gold-tinted glows in the corners */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-180px', right: '-160px', width: '640px', height: '640px',
            background: 'radial-gradient(circle at 70% 30%, rgba(217,166,60,0.22) 0%, transparent 62%)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-200px', left: '-180px', width: '680px', height: '680px',
            background: 'radial-gradient(circle at 30% 70%, rgba(184,134,46,0.18) 0%, transparent 60%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative w-full max-w-[560px] px-4"
          style={{ perspective: 1200 }}
        >
          <div className="relative" style={{ backgroundColor: cardBg, border: `1px solid ${goldSoft}` }}>
            <div className="login-gold-line" />
            <div
              className="absolute pointer-events-none"
              style={{ top: 0, right: 0, width: 26, height: 26, borderTop: `2.5px solid ${goldMid}`, borderRight: `2.5px solid ${goldMid}` }}
            />
            <div
              className="absolute pointer-events-none"
              style={{ bottom: 0, left: 0, width: 26, height: 26, borderBottom: `2.5px solid ${goldMid}`, borderLeft: `2.5px solid ${goldMid}` }}
            />
            <div className="p-7 sm:p-10 sm:pt-9 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(217,166,60,0.14)', border: `1px solid ${goldSoft}` }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: goldMid }} />
              </motion.div>
              <h2 className="font-fraunces text-[1.6rem] sm:text-[1.85rem] font-semibold leading-tight" style={{ color: ink }}>
                Registration submitted!
              </h2>
              <p className="mt-2 text-[0.95rem]" style={{ color: tan }}>
                Check your email for a confirmation link. Our team will review your application within 48 hours.
              </p>
              <div className="mt-7">
                <Link
                  href="/supplier/login"
                  className="login-gold-btn inline-flex items-center gap-2 px-7 py-3 text-[1rem] font-semibold tracking-wide"
                >
                  Go to Supplier Sign In
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden flex items-center justify-center min-h-screen pt-[84px] sm:pt-[96px] md:pt-[100px] pb-12"
      style={{ backgroundColor: creamBg }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* soft radial gold-tinted glows in the corners */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-180px', right: '-160px', width: '640px', height: '640px',
          background: 'radial-gradient(circle at 70% 30%, rgba(217,166,60,0.22) 0%, transparent 62%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-200px', left: '-180px', width: '680px', height: '680px',
          background: 'radial-gradient(circle at 30% 70%, rgba(184,134,46,0.18) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%', left: '8%', width: '420px', height: '420px',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,230,160,0.16) 0%, transparent 60%)',
        }}
      />

      {/* entrance: fade + slide up + subtle 3D rotate settling to flat */}
      <motion.div
        initial={{ opacity: 0, y: 46, rotateX: -14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="relative w-full max-w-[560px] px-4"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="relative"
          style={{ transformStyle: 'preserve-3d', rotateX: tiltX, rotateY: tiltY }}
        >
          {/* card — wider than login, square corners everywhere, thin warm 1px border */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${goldSoft}` }}>
            {/* animated gold gradient line across the top edge */}
            <div className="login-gold-line" />

            {/* gold corner-bracket accents at two opposite corners */}
            <div
              className="absolute pointer-events-none"
              style={{ top: 0, right: 0, width: 26, height: 26, borderTop: `2.5px solid ${goldMid}`, borderRight: `2.5px solid ${goldMid}` }}
            />
            <div
              className="absolute pointer-events-none"
              style={{ bottom: 0, left: 0, width: 26, height: 26, borderBottom: `2.5px solid ${goldMid}`, borderLeft: `2.5px solid ${goldMid}` }}
            />

            <div className="p-6 sm:p-10 sm:pt-9">
              {/* wordmark heading block — text only, nothing decorative above */}
              <div className="mb-8">
                <h1
                  className="font-fraunces text-[1.9rem] sm:text-[2.2rem] font-semibold leading-tight"
                  style={{ color: ink }}
                >
                  Become a Supplier
                </h1>
                <p className="mt-2 text-[0.95rem]" style={{ color: tan }}>
                  Join 500+ verified suppliers on Core Collective
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-5" noValidate>
                {/* --- Personal Information --- */}
                <SectionLabel>Personal Information</SectionLabel>

                {/* Full Name + Phone side by side; stacks below ~600px */}
                <div className="grid grid-cols-1 gap-5 min-[600px]:grid-cols-2">
                  <Field
                    icon={User} label="Full Name" required
                    type="text" value={form.name} onChange={set('name')}
                    placeholder="John Doe" autoComplete="name"
                  />
                  <Field
                    icon={Phone} label="Phone" required
                    type="tel" value={form.phone} onChange={set('phone')}
                    placeholder="+92 300 000 0000" autoComplete="tel"
                  />
                </div>

                <Field
                  icon={Mail} label="Email" required
                  type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" autoComplete="email"
                />

                <Field
                  icon={Lock} label="Password" required
                  type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters" autoComplete="new-password"
                  toggle={{ shown: showPassword, onToggle: () => setShowPassword(!showPassword) }}
                />

                <Field
                  icon={Lock} label="Confirm Password" required
                  type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Repeat your password" autoComplete="new-password"
                  toggle={{ shown: showConfirmPassword, onToggle: () => setShowConfirmPassword(!showConfirmPassword) }}
                />

                {/* --- Business Details --- */}
                <div className="pt-2">
                  <SectionLabel>Business Details</SectionLabel>
                </div>

                <Field
                  icon={Building2} label="Company Name" required
                  type="text" value={form.companyName} onChange={set('companyName')}
                  placeholder="Your Company Ltd." autoComplete="organization"
                />

                <Field
                  icon={Globe} label="Company Website" optional
                  type="url" value={form.companyWebsite} onChange={set('companyWebsite')}
                  placeholder="https://example.com"
                />

                <Field
                  icon={Tag} label="Business Type" optional
                  type="text" value={form.businessType} onChange={set('businessType')}
                  placeholder="Manufacturer / Distributor / Wholesaler"
                />

                <Field
                  icon={Package} label="Product Categories" optional
                  type="text" value={form.productCategories} onChange={set('productCategories')}
                  placeholder="Electronics, Clothing, Furniture"
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[0.85rem] px-3 py-2"
                    style={{ color: '#9B2C2C', backgroundColor: 'rgba(170,60,40,0.08)', border: '1px solid rgba(155,44,44,0.25)' }}
                  >
                    {error}
                  </motion.p>
                )}

                {/* terms agreement */}
                <p className="text-[0.78rem] leading-relaxed" style={{ color: tan }}>
                  By registering, you agree to our{' '}
                  <Link href="/terms" className="underline underline-offset-2" style={{ color: goldDark }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/terms" className="underline underline-offset-2" style={{ color: goldDark }}>
                    Supplier Agreement
                  </Link>
                  .
                </p>

                {/* Register as Supplier */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={loading ? {} : { y: -2, boxShadow: '0 14px 34px -10px rgba(122,86,38,0.55)' }}
                  whileTap={loading ? {} : { y: 1, scale: 0.985, boxShadow: 'inset 0 4px 10px rgba(58,38,10,0.35)' }}
                  className="login-gold-btn w-full py-3.5 text-[1rem] font-semibold tracking-wide inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                  {loading ? 'Submitting...' : 'Register as Supplier'}
                </motion.button>
              </form>

              {/* sign in link */}
              <div className="mt-7 text-center">
                <p className="text-[0.9rem]" style={{ color: tan }}>
                  Already registered?{' '}
                  <Link href="/supplier/login" className="font-semibold" style={{ color: goldDark }}>
                    Sign in
                  </Link>
                </p>
              </div>

              {/* buyer signup */}
              <div className="mt-5 text-center pt-5" style={{ borderTop: `1px solid ${goldSoft}` }}>
                <Link href="/signup" className="inline-flex items-center gap-1.5 text-[0.82rem]" style={{ color: tan }}>
                  <span className="w-2 h-2" style={{ backgroundColor: goldMid, transform: 'rotate(45deg)' }} />
                  Register as a buyer
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SupplierSignupCard;
