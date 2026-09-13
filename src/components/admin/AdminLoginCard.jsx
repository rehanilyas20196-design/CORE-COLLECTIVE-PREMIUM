'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Mail, Lock, Loader, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';

const ADMIN_EMAIL = 'hinata4020196@gmail.com';
const ADMIN_PASSWORD = 'pak@2233';

const creamBg = '#EFE3C8';
const cardBg = '#FBF5E8';
const ink = '#2B2013';
const tan = '#7A6A4C';
const goldSoft = 'rgba(140,105,40,0.28)';
const goldMid = '#D9A63C';
const goldDark = '#8A6A1E';
const inputBg = '#FFFCF4';

export default function AdminLoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState(ADMIN_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

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

  const doSignIn = async () => {
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;
    return user;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      let user;
      try {
        user = await doSignIn();
      } catch (err) {
        if (!/invalid.*credential|email not confirmed/i.test(err.message || '')) throw err;
        await api.auth.ensureAdmin();
        user = await doSignIn();
      }
      if (user) {
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
        router.refresh();
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Invalid admin credentials' : err.message);
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
      <div
        className="absolute pointer-events-none"
        style={{ top: '-180px', right: '-160px', width: '640px', height: '640px', background: 'radial-gradient(circle at 70% 30%, rgba(217,166,60,0.22) 0%, transparent 62%)' }}
      />
      <div
        className="absolute pointer-events-none"
        style={{ bottom: '-200px', left: '-180px', width: '680px', height: '680px', background: 'radial-gradient(circle at 30% 70%, rgba(184,134,46,0.18) 0%, transparent 60%)' }}
      />
      <div
        className="absolute pointer-events-none"
        style={{ top: '30%', left: '8%', width: '420px', height: '420px', background: 'radial-gradient(circle at 50% 50%, rgba(255,230,160,0.16) 0%, transparent 60%)' }}
      />

      <motion.div
        ref={frameRef}
        initial={{ opacity: 0, y: 46, rotateX: -14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="relative w-full max-w-[440px]"
        style={{ perspective: 1200 }}
      >
        <motion.div className="relative" style={{ transformStyle: 'preserve-3d', rotateX: tiltX, rotateY: tiltY }}>
          <div style={{ backgroundColor: cardBg, border: `1px solid ${goldSoft}` }}>
            <div className="login-gold-line" />
            <div className="absolute pointer-events-none" style={{ top: 0, right: 0, width: 26, height: 26, borderTop: `2.5px solid ${goldMid}`, borderRight: `2.5px solid ${goldMid}` }} />
            <div className="absolute pointer-events-none" style={{ bottom: 0, left: 0, width: 26, height: 26, borderBottom: `2.5px solid ${goldMid}`, borderLeft: `2.5px solid ${goldMid}` }} />

            <div className="p-7 sm:p-10 sm:pt-9">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8C04A] to-[#a67c2e] flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-fraunces text-[1.9rem] sm:text-[2.2rem] font-semibold leading-tight" style={{ color: ink }}>
                      Admin Panel
                    </h1>
                    <p className="text-[0.85rem]" style={{ color: goldMid }}>Restricted access</p>
                  </div>
                </div>
                <p className="mt-3 text-[0.95rem]" style={{ color: tan }}>
                  Sign in with the admin account to manage the marketplace.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5" noValidate>
                <div>
                  <label className="block text-[0.82rem] font-medium mb-1.5 tracking-wide" style={{ color: tan }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: focusedField === 'email' ? goldMid : tan }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...fieldBase,
                        borderColor: focusedField === 'email' ? goldMid : goldSoft,
                        boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(217,166,60,0.16), 0 0 20px rgba(217,166,60,0.12)' : 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.82rem] font-medium mb-1.5 tracking-wide" style={{ color: tan }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: focusedField === 'password' ? goldMid : tan }} />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...fieldBase,
                        borderColor: focusedField === 'password' ? goldMid : goldSoft,
                        boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(217,166,60,0.16), 0 0 20px rgba(217,166,60,0.12)' : 'none',
                      }}
                    />
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
                  {loading ? 'Signing in...' : 'Login to Admin Panel'}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[0.8rem]" style={{ color: tan }}>
                  Admin credentials are pre-filled below &middot; just click login
                </p>
                <Link href="/login" className="inline-flex items-center gap-1.5 mt-3 text-[0.82rem]" style={{ color: tan }}>
                  <span className="w-2 h-2" style={{ backgroundColor: goldMid, transform: 'rotate(45deg)' }} />
                  Back to user login
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}