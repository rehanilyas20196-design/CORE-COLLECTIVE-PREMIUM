'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { clientTokenForEnvironment, validateClientToken } from '../../lib/paddle.mjs';

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
  const code = event?.code || event?.type || 'checkout_error';
  const detail = event?.detail || 'Paddle could not open the checkout.';
  return `Paddle checkout error (${code}): ${detail}`;
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export default function PaddleCheckout({ lines, disabled, onOpened, onError, onProcessing }) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');
  const [errorInfo, setErrorInfo] = useState(null);

  // Receive Paddle.js checkout.error/warning events (including the 400 from the
  // checkout service, which is emitted as an event and never rejects the
  // Checkout.open() promise).
  useEffect(() => {
    const handler = (event) => {
      const message = formatCheckoutEvent(event);
      // Keep the raw payload in the console for debugging; it never contains
      // secrets (it mirrors a Paddle API error: code/detail/documentation_url).
      console.error('[paddle] checkout error event', event);
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
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-[4px] bg-[#071F57] hover:bg-[#0d2f80] text-white font-semibold transition-colors disabled:opacity-60"
      >
        {opening ? <Loader className="w-4 h-4 animate-spin" /> : <LockIcon />}
        {opening ? 'Preparing Paddle...' : 'Pay Securely with Paddle'}
      </button>
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
