'use client';

import { useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export default function PaddleCheckout({ lines, disabled, onOpened, onError, onProcessing }) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    setError('');
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!token) {
      const msg =
        'Paddle is not configured yet. Set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN (client-side token from your Paddle dashboard) to enable Paddle checkout.';
      setError(msg);
      onError?.(msg);
      return;
    }
    if (disabled) {
      const msg = 'You need to be signed in to place an order.';
      setError(msg);
      onError?.(msg);
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
      if (!res.ok) throw new Error(data.error || 'Could not start Paddle checkout.');

      const { initializePaddle } = await import('@paddle/paddle-js');
      const paddle = await initializePaddle({ token, environment: data.environment || 'sandbox' });

      const origin = window.location.origin;
      const params = new URLSearchParams({
        order_id: String(data.orderId),
        provider: 'paddle',
        amount: String(data.amount),
      });

      // The server created a draft Paddle transaction carrying our
      // order_id in custom_data, with one non-catalog item per cart line.
      // Paddle's overlay collects email/address and handles Visa, Mastercard,
      // PayPal, Apple Pay, Google Pay etc. We never touch raw card data, and
      // we never mark the order paid — only the verified /api/webhooks/paddle
      // event does that.
      await paddle.Checkout.open({
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
      const msg = err.message || 'Paddle checkout could not be opened.';
      setError(msg);
      onError?.(msg);
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
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
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