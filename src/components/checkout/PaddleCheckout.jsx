'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  clientTokenForEnvironment,
  validateClientToken,
  describeCheckoutError,
  isRedirectUrlConfigError,
  redirectUrlConfigMessage,
} from '../../lib/paddle.mjs';

// Public, build-time configuration. Sandbox and live client-side tokens are
// kept separate so a single PADDLE_ENV switch on the server is mirrored here by
// NEXT_PUBLIC_PADDLE_ENV. Client-side tokens are safe to expose.
const HINT_ENV = process.env.NEXT_PUBLIC_PADDLE_ENV || '';
const SANDBOX_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';
const LIVE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_LIVE_CLIENT_TOKEN || '';

function tokenFor(environment) {
  return clientTokenForEnvironment(environment, {
    sandboxToken: SANDBOX_TOKEN,
    liveToken: LIVE_TOKEN,
    legacyToken: SANDBOX_TOKEN,
  });
}

// Paddle.js should be initialized once per page load. Re-initializing on every
// click can leave a stale instance behind, so cache it per token/environment.
let paddleSingleton = null;
// The component registers here so the initialization-level eventCallback can
// push `checkout.error` details into React state.
let checkoutErrorSink = null;

function ensurePaddle(environment, token) {
  const key = `${environment}:${token}`;
  if (!paddleSingleton || paddleSingleton.key !== key) {
    const promise = import('@paddle/paddle-js').then(({ initializePaddle }) =>
      initializePaddle({
        token,
        environment,
        eventCallback: (event) => {
          const name = event?.name;
          if (name === 'checkout.error' || name === 'checkout.payment.error' || name === 'checkout.warning') {
            checkoutErrorSink?.(event);
          }
        },
      })
    );
    paddleSingleton = { key, promise };
    // Don't cache a failed initialization forever — let a retry try again.
    const reset = () => {
      if (paddleSingleton?.key === key) paddleSingleton = null;
    };
    promise.then((instance) => {
      if (!instance) reset();
    }, reset);
  }
  return paddleSingleton.promise;
}

function formatCheckoutEvent(event) {
  const { type, code, detail } = describeCheckoutError(event);
  const label = [type, code].filter(Boolean).join(' ') || 'checkout_error';
  return `Paddle checkout error (${label}): ${detail || 'Paddle could not open the checkout.'}`;
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export default function PaddleCheckout({ lines, disabled, onOpened, onError, onProcessing }) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');
  const [errorInfo, setErrorInfo] = useState(null);
  const [notice, setNotice] = useState('');
  // The most recent Checkout.open() call, so an error event can be retried
  // without the redirect URLs that Paddle rejected.
  const lastOpenRef = useRef(null);

  // Receive Paddle.js checkout.error/warning events (including the 400 from the
  // checkout service, which is emitted as an event and never rejects the
  // Checkout.open() promise).
  useEffect(() => {
    const handler = (event) => {
      // Log real JSON (not an object the console renders as `Object`) so the
      // error can be copied straight out of the console.
      console.error('[paddle] checkout error event', JSON.stringify(describeCheckoutError(event)));

      // successUrl/failureUrl on a non-approved domain fail here. Paddle uses
      // the account's default payment link when no redirect URLs are given, so
      // reopen once without them rather than losing the sale.
      const pending = lastOpenRef.current;
      if (isRedirectUrlConfigError(event) && pending && !pending.retried) {
        pending.retried = true;
        setNotice(redirectUrlConfigMessage());
        setError('');
        setErrorInfo(null);
        pending.paddle.Checkout.open({ transactionId: pending.transactionId });
        return;
      }

      const message = formatCheckoutEvent(event);
      setError(message);
      setErrorInfo({
        code: event?.code || event?.type || null,
        detail: event?.detail || null,
        documentation_url: event?.documentation_url || null,
      });
      onError?.(message);
    };
    checkoutErrorSink = handler;
    return () => {
      if (checkoutErrorSink === handler) checkoutErrorSink = null;
    };
  }, [onError]);

  const fail = (message) => {
    setError(message);
    setErrorInfo(null);
    onError?.(message);
  };

  const start = async () => {
    setError('');
    setErrorInfo(null);
    setNotice('');

    if (disabled) {
      fail('You need to be signed in to place an order.');
      return;
    }

    // Fail fast with an actionable message for the most common sandbox
    // misconfiguration (missing or environment-mismatched client-side token).
    const preEnv = HINT_ENV === 'production' ? 'production' : 'sandbox';
    try {
      validateClientToken(tokenFor(preEnv), preEnv);
    } catch (err) {
      fail(err.message);
      return;
    }

    setOpening(true);
    onProcessing?.(true);
    try {
      const accessToken = await getAccessToken();
      const res = await fetch('/api/payments/paddle/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ lines }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const paddleDetail = data?.paddle?.detail ? ` ${data.paddle.detail}` : '';
        throw new Error(`${data.error || 'Could not start Paddle checkout.'}${paddleDetail}`);
      }

      // The server is the source of truth for the environment.
      const environment = data.environment === 'production' ? 'production' : 'sandbox';
      const token = tokenFor(environment);
      validateClientToken(token, environment);

      const paddle = await ensurePaddle(environment, token);
      if (!paddle) {
        throw new Error('Paddle.js could not be initialized. Check the client-side token and environment.');
      }

      const origin = window.location.origin;
      const params = new URLSearchParams({
        order_id: String(data.orderId),
        provider: 'paddle',
        amount: String(data.amount),
      });

      // The server created a draft Paddle transaction carrying our order_id in
      // custom_data, with one non-catalog item per cart line. Paddle's overlay
      // collects email/address and handles Visa, Mastercard, PayPal, Apple Pay,
      // Google Pay etc. We never touch raw card data, and we never mark the
      // order paid — only the verified /api/webhooks/paddle event does that.
      lastOpenRef.current = { paddle, transactionId: data.transactionId, retried: false };
      paddle.Checkout.open({
        transactionId: data.transactionId,
        settings: {
          displayMode: 'overlay',
          frameTarget: 'self',
          theme: 'light',
          locale: 'en',
          successUrl: `${origin}/success?${params.toString()}`,
          failureUrl: `${origin}/checkout?cancel=1`,
        },
      });

      // Checkout overlay is now open. Paddle navigates to successUrl /
      // failureUrl itself on completion or cancel.
      onOpened?.(data.orderId);
    } catch (err) {
      fail(err.message || 'Paddle checkout could not be opened.');
    } finally {
      setOpening(false);
      onProcessing?.(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={start}
        disabled={opening || disabled}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-md bg-black hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
      >
        {opening ? <Loader className="w-4 h-4 animate-spin" /> : <LockIcon />}
        {opening ? 'Preparing Paddle...' : 'Pay Securely with Paddle'}
      </button>
      {notice && (
        <div className="flex items-start gap-2 p-3 text-sm border border-amber-300 bg-amber-50 text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{notice}</p>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 p-3 text-sm border border-red-300 bg-red-50 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <div className="space-y-1">
            <p>{error}</p>
            {errorInfo?.documentation_url && (
              <a
                href={errorInfo.documentation_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium underline"
              >
                Paddle documentation <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
