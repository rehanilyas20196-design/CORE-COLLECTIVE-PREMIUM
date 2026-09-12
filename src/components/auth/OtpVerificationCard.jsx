'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader, ArrowRight, ShieldCheck, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const creamBg = '#EFE3C8';
const cardBg = '#FBF5E8';
const ink = '#2B2013';
const tan = '#7A6A4C';
const goldSoft = 'rgba(140,105,40,0.28)';
const goldMid = '#B8862E';
const goldDark = '#8A6A1E';
const inputBg = '#FFFCF4';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

/**
 * Reusable OTP verification screen shown after signup.
 * Props:
 *  - email:            the email the OTP was sent to
 *  - successHref:      where to navigate after successful verification
 *  - onVerified?:      optional callback fired after verification (before navigation)
 *  - onResend?:        optional async function to re-send the OTP (defaults to supabase.auth.resend)
 *  - backHref:         link shown at the bottom (e.g. /login)
 *  - backLabel:        label for the bottom link
 *  - title:            heading text
 *  - subtext:          text under the heading
 */
function OtpVerificationCard({
  email,
  successHref = '/',
  onVerified,
  onResend,
  backHref = '/login',
  backLabel = 'Back to sign in',
  title = 'Verify your email',
  subtext,
  successTitle = 'Email verified!',
  successText = 'Your account is confirmed. Taking you to the marketplace...',
}) {
  const router = useRouter();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const inputsRef = useRef([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => {
      if (!mountedRef.current) return;
      setCooldown(c => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    // auto-focus first box on mount
    inputsRef.current[0]?.focus();
  }, []);

  const code = digits.join('');

  const setDigit = (index, value) => {
    setError('');
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      setDigits(prev => prev.map((d, i) => (i === index ? '' : d)));
      return;
    }
    if (clean.length > 1) {
      // paste or fast-typing multiple digits: distribute across boxes
      setDigits(prev => {
        const next = [...prev];
        for (let i = 0; i < clean.length && index + i < OTP_LENGTH; i++) {
          next[index + i] = clean[i];
        }
        return next;
      });
      const target = Math.min(index + clean.length, OTP_LENGTH - 1);
      inputsRef.current[target]?.focus();
      return;
    }
    setDigits(prev => prev.map((d, i) => (i === index ? clean : d)));
    if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      setDigits(prev => {
        const next = [...prev];
        if (next[index]) {
          next[index] = '';
        } else if (index > 0) {
          next[index - 1] = '';
          inputsRef.current[index - 1]?.focus();
        }
        return next;
      });
      setError('');
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    setDigits(prev => {
      const next = [...prev];
      for (let i = 0; i < text.length; i++) next[i] = text[i];
      return next;
    });
    inputsRef.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (code.length < OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }
    setVerifying(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      });
      if (verifyError) throw verifyError;
      if (onVerified) await onVerified();
      setSuccess(true);
      setTimeout(() => {
        router.push(successHref);
        router.refresh();
      }, 1600);
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('expired') || msg.includes('invalid')) {
        setError('Invalid or expired code. Please request a new one.');
      } else {
        setError(err?.message || 'Verification failed. Please try again.');
      }
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (resending || cooldown > 0) return;
    setResending(true);
    setError('');
    try {
      if (onResend) {
        await onResend(email);
      } else {
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
        });
        if (resendError) throw resendError;
      }
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err?.message || 'Could not resend the code. Please try again.');
    } finally {
      setResending(false);
    }
  }, [email, onResend, cooldown, resending]);

  const boxStyle = (hasValue) => ({
    width: '3.25rem',
    height: '3.75rem',
    backgroundColor: inputBg,
    border: `1px solid ${hasValue ? goldMid : goldSoft}`,
    color: ink,
    fontSize: '1.4rem',
    fontWeight: 600,
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: hasValue ? '0 0 0 3px rgba(217,166,60,0.16), 0 0 20px rgba(217,166,60,0.12)' : 'none',
  });

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
        initial={{ opacity: 0, y: 46, rotateX: -14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="relative w-full max-w-[440px] px-4"
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

          {success ? (
            <div className="p-7 sm:p-10 sm:pt-9 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(217,166,60,0.14)', border: `1px solid ${goldSoft}` }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: goldMid }} />
              </motion.div>
              <h2 className="font-fraunces text-[1.6rem] font-semibold leading-tight" style={{ color: ink }}>
                {successTitle}
              </h2>
              <p className="mt-2 text-[0.95rem]" style={{ color: tan }}>
                {successText}
              </p>
            </div>
          ) : (
            <div className="p-7 sm:p-10 sm:pt-9">
              {/* icon badge */}
              <div className="flex justify-center mb-5">
                <div
                  className="w-14 h-14 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(217,166,60,0.14)', border: `1px solid ${goldSoft}` }}
                >
                  <ShieldCheck className="w-7 h-7" style={{ color: goldMid }} />
                </div>
              </div>

              <div className="mb-8 text-center">
                <h1
                  className="font-fraunces text-[1.9rem] sm:text-[2.2rem] font-semibold leading-tight"
                  style={{ color: ink }}
                >
                  {title}
                </h1>
                <p className="mt-2 text-[0.95rem]" style={{ color: tan }}>
                  {subtext || (
                    <>
                      Enter the 6-digit code sent to{' '}
                      <span className="font-semibold" style={{ color: ink }}>{email}</span>
                    </>
                  )}
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-5" noValidate>
                {/* 6-digit boxes */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputsRef.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      maxLength={1}
                      value={digit}
                      onChange={e => setDigit(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      onFocus={e => e.target.select()}
                      aria-label={`Digit ${i + 1}`}
                      style={boxStyle(!!digit)}
                      disabled={verifying}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[0.85rem] px-3 py-2 flex items-center gap-2"
                    style={{ color: '#9B2C2C', backgroundColor: 'rgba(170,60,40,0.08)', border: '1px solid rgba(155,44,44,0.25)' }}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.p>
                )}

                {/* Verify button */}
                <motion.button
                  type="submit"
                  disabled={verifying}
                  whileHover={verifying ? {} : { y: -2, boxShadow: '0 14px 34px -10px rgba(122,86,38,0.55)' }}
                  whileTap={verifying ? {} : { y: 1, scale: 0.985, boxShadow: 'inset 0 4px 10px rgba(58,38,10,0.35)' }}
                  className="login-gold-btn w-full py-3.5 text-[1rem] font-semibold tracking-wide inline-flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader className="w-5 h-5" />
                    </motion.span>
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                  {verifying ? 'Verifying...' : 'Verify Code'}
                </motion.button>

                {/* resend */}
                <div className="text-center">
                  {cooldown > 0 ? (
                    <p className="text-[0.85rem]" style={{ color: tan }}>
                      Didn&apos;t get a code? Resend in{' '}
                      <span className="font-semibold" style={{ color: ink }}>{cooldown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold cursor-pointer disabled:opacity-50"
                      style={{ color: goldDark }}
                    >
                      {resending ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <RotateCw className="w-3.5 h-3.5" />
                        </motion.span>
                      ) : (
                        <RotateCw className="w-3.5 h-3.5" />
                      )}
                      Resend code
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center pt-5" style={{ borderTop: `1px solid ${goldSoft}` }}>
                <Link href={backHref} className="text-[0.82rem]" style={{ color: tan }}>
                  {backLabel}
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default OtpVerificationCard;
