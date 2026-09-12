'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';
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
const REMEMBER_KEY = 'corecollective_remember_email';

function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  // --- 3D tilt toward the cursor ---
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 120, damping: 18, mass: 0.4 });
  const springY = useSpring(rotateY, { stiffness: 120, damping: 18, mass: 0.4 });
  const tiltX = useTransform(springX, [8, -8], [8, -8]);
  const tiltY = useTransform(springY, [8, -8], [8, -8]);
  const frameRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {}
  }, []);

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

      if (rememberMe) {
        try { localStorage.setItem(REMEMBER_KEY, email); } catch {}
      } else {
        try { localStorage.removeItem(REMEMBER_KEY); } catch {}
      }

      if (user) {
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
      }
      if (user?.email === 'rehanilyas20196@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/');
      }
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

      <motion.div
        ref={frameRef}
        initial={{ opacity: 0, y: 46, rotateX: -14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="relative w-full max-w-[440px]"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="relative"
          style={{ transformStyle: 'preserve-3d', rotateX: tiltX, rotateY: tiltY }}
        >
          {/* card */}
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
              {/* wordmark heading block — no decorative graphics above it */}
              <div className="mb-8">
                <h1
                  className="font-fraunces text-[1.9rem] sm:text-[2.2rem] font-semibold leading-tight"
                  style={{ color: ink }}
                >
                  Welcome back
                </h1>
                <p className="mt-2 text-[0.95rem]" style={{ color: tan }}>
                  Sign in to your Core Collective account
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
                      style={{
                        ...fieldBase,
                        borderColor: focusedField === 'email' ? goldMid : goldSoft,
                        boxShadow: focusedField === 'email'
                          ? '0 0 0 3px rgba(217,166,60,0.16), 0 0 20px rgba(217,166,60,0.12)'
                          : 'none',
                      }}
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
                      style={{
                        ...fieldBase,
                        paddingRight: '3.4rem',
                        borderColor: focusedField === 'password' ? goldMid : goldSoft,
                        boxShadow: focusedField === 'password'
                          ? '0 0 0 3px rgba(217,166,60,0.16), 0 0 20px rgba(217,166,60,0.12)'
                          : 'none',
                      }}
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

                {/* Remember me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 cursor-pointer rounded-none"
                      style={{ accentColor: goldMid }}
                    />
                    <span className="text-[0.85rem]" style={{ color: tan }}>Remember me</span>
                  </label>
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

              {/* create account */}
              <div className="mt-7 text-center">
                <p className="text-[0.9rem]" style={{ color: tan }}>
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="font-semibold" style={{ color: goldDark }}>
                    Create one
                  </Link>
                </p>
              </div>

              {/* supplier login */}
              <div className="mt-5 text-center pt-5" style={{ borderTop: `1px solid ${goldSoft}` }}>
                <Link href="/supplier/login" className="inline-flex items-center gap-1.5 text-[0.82rem]" style={{ color: tan }}>
                  <span className="w-2 h-2" style={{ backgroundColor: goldMid, transform: 'rotate(45deg)' }} />
                  Supplier login
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

export default LoginCard;