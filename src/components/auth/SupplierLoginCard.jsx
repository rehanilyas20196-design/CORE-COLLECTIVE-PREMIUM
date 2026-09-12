'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader, ArrowRight, Store } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const creamBg = '#EFE3C8';
const cardBg = '#FBF5E8';
const ink = '#2B2013';
const tan = '#7A6A4C';
const goldSoft = 'rgba(140,105,40,0.28)';
const goldLight = '#D9A63C';
const goldMid = '#B8862E';
const goldDark = '#8A6A1E';
const inputBg = '#FFFCF4';

const glowIn = '0 0 0 3px rgba(217,166,60,0.16), 0 0 20px rgba(217,166,60,0.12)';

function SupplierLoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  // --- 3D tilt toward the cursor (same treatment as buyer auth cards) ---
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 120, damping: 18, mass: 0.4 });
  const springY = useSpring(rotateY, { stiffness: 120, damping: 18, mass: 0.4 });
  const tiltX = useTransform(springX, [8, -8], [8, -8]);
  const tiltY = useTransform(springY, [8, -8], [8, -8]);
  const frameRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = frameRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const px = Math.min(1, Math.max(-1, (e.clientX - cx) / (rect.width / 2)));
      const py = Math.min(1, Math.max(-1, (e.clientY - cy) / (rect.height / 2)));
      rotateY.set(px * 8);
      rotateX.set(-py * 8);
    },
    [rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
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

  const fieldStyle = (field, extra = {}) => ({
    ...fieldBase,
    ...extra,
    borderColor: focusedField === field ? goldMid : goldSoft,
    boxShadow: focusedField === field ? glowIn : 'none',
  });

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
        className="relative w-full max-w-[440px] px-4"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="relative"
          style={{ transformStyle: 'preserve-3d', rotateX: tiltX, rotateY: tiltY }}
        >
          {/* card — square corners everywhere, thin warm 1px border */}
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

            <div className="p-7 sm:p-10 sm:pt-9">
              {/* small square store-icon badge — functional, not a brand logo */}
              <div className="flex justify-center mb-5">
                <div
                  className="w-14 h-14 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(217,166,60,0.14)', border: `1px solid ${goldSoft}` }}
                >
                  <Store className="w-7 h-7" style={{ color: goldMid }} />
                </div>
              </div>

              {/* heading block */}
              <div className="mb-8 text-center">
                <h1
                  className="font-fraunces text-[1.9rem] sm:text-[2.2rem] font-semibold leading-tight"
                  style={{ color: goldMid }}
                >
                  Supplier Sign In
                </h1>
                <p className="mt-2 text-[0.95rem]" style={{ color: tan }}>
                  Access your supplier dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5" noValidate>
                {/* Email */}
                <div>
                  <label className="block text-[0.82rem] font-medium mb-1.5 tracking-wide" style={{ color: tan }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: focusedField === 'email' ? goldMid : tan }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      style={fieldStyle('email')}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[0.82rem] font-medium mb-1.5 tracking-wide" style={{ color: tan }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: focusedField === 'password' ? goldMid : tan }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      style={fieldStyle('password', { paddingRight: '3.4rem' })}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ color: tan }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

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

                {/* Sign In */}
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
                  {loading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </form>

              {/* register link */}
              <div className="mt-7 text-center">
                <p className="text-[0.9rem]" style={{ color: tan }}>
                  Not a supplier yet?{' '}
                  <Link href="/supplier/signup" className="font-semibold" style={{ color: goldDark }}>
                    Register here
                  </Link>
                </p>
              </div>

              {/* buyer sign in — divider labeled "buyer access" */}
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1" style={{ backgroundColor: goldSoft }} />
                <span className="text-[0.68rem] uppercase tracking-[0.18em]" style={{ color: tan }}>
                  buyer access
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: goldSoft }} />
              </div>
              <div className="mt-4 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-[0.82rem]" style={{ color: tan }}>
                  <span className="w-2 h-2" style={{ backgroundColor: goldMid, transform: 'rotate(45deg)' }} />
                  Buyer sign in
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

export default SupplierLoginCard;
