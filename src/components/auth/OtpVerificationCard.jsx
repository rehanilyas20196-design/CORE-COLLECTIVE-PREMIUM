'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, Loader, RotateCw, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

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
  successText = 'Your account is confirmed. Taking you to the marketplace…',
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
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      if (!mountedRef.current) return;
      setCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const code = digits.join('');

  const setDigit = (index, value) => {
    setError('');
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      setDigits((previous) => previous.map((digit, digitIndex) => (digitIndex === index ? '' : digit)));
      return;
    }
    if (clean.length > 1) {
      setDigits((previous) => {
        const next = [...previous];
        for (let offset = 0; offset < clean.length && index + offset < OTP_LENGTH; offset += 1) {
          next[index + offset] = clean[offset];
        }
        return next;
      });
      inputsRef.current[Math.min(index + clean.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    setDigits((previous) => previous.map((digit, digitIndex) => (digitIndex === index ? clean : digit)));
    if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      setDigits((previous) => {
        const next = [...previous];
        if (next[index]) {
          next[index] = '';
        } else if (index > 0) {
          next[index - 1] = '';
          inputsRef.current[index - 1]?.focus();
        }
        return next;
      });
      setError('');
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) return;
    setDigits((previous) => {
      const next = [...previous];
      for (let index = 0; index < text.length; index += 1) next[index] = text[index];
      return next;
    });
    inputsRef.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async (event) => {
    event.preventDefault();
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
        type: 'email',
      });
      if (verifyError) throw verifyError;
      if (onVerified) await onVerified();
      setSuccess(true);
      setTimeout(() => {
        router.push(successHref);
        router.refresh();
      }, 1600);
    } catch (err) {
      const message = (err?.message || '').toLowerCase();
      if (message.includes('expired') || message.includes('invalid')) {
        setError('Invalid or expired code. Please request a new one.');
      } else {
        setError('Verification failed. Please try again.');
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
    } catch {
      setError('Could not resend the code. Please try again.');
    } finally {
      setResending(false);
    }
  }, [cooldown, email, onResend, resending]);

  const boxClass = (hasValue) =>
    `h-14 w-12 rounded-lg border text-center text-xl font-semibold text-black outline-none transition-all focus:border-black focus:bg-white sm:h-16 sm:w-14 sm:text-2xl ${
      hasValue ? 'border-black bg-white' : 'border-gray-200 bg-gray-50'
    }`;

  return (
    <div className="auth-shell flex min-h-screen items-center justify-center bg-white px-4 pt-24 sm:pt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <span className="auth-brand">Core Collective</span>
          <span className="auth-eyebrow">Secure account verification</span>
          <div className="mx-auto mb-5 mt-7 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-black">
            {success ? <CheckCircle2 className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
          </div>
          <h1 className="auth-title mt-0">
            {success ? successTitle : title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-gray-500">
            {success ? (
              successText
            ) : (
              subtext || (
                <>
                  Enter the 6-digit code sent to <span className="font-semibold text-black">{email}</span>
                </>
              )
            )}
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <CheckCircle2 className="mx-auto h-12 w-12 text-black" strokeWidth={1.5} />
            <p className="mt-4 text-sm leading-6 text-gray-500">Redirecting you securely…</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-8" noValidate>
            <div className="flex justify-center gap-2 sm:gap-3">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => setDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  onFocus={(event) => event.currentTarget.select()}
                  aria-label={`Digit ${index + 1}`}
                  className={boxClass(Boolean(digit))}
                  disabled={verifying}
                />
              ))}
            </div>

            {error && (
              <div className="auth-error flex items-start gap-2.5" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={verifying}
              className="auth-button"
            >
              {verifying ? <Loader className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {verifying ? 'Verifying…' : 'Verify code'}
            </button>

            <div className="text-center">
              {cooldown > 0 ? (
                <p className="text-[13px] leading-5 text-gray-500">
                  Didn&apos;t get a code? Resend in <span className="font-semibold text-black">{cooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-black hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resending ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
                  Resend code
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 pt-5 text-center">
              <Link href={backHref} className="text-[13px] font-semibold text-black hover:underline">
                {backLabel}
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default OtpVerificationCard;
