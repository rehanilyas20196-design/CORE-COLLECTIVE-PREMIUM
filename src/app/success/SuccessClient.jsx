'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Loader, XCircle, RotateCcw, Undo2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';

const panelBg = '#F7EFDC';
const cardBg = '#FBF5E8';
const ink = '#2B2013';
const tan = '#7A6A4C';
const goldDeep = '#8A6A1E';
const goldMid = '#B8862E';
const goldSoft = 'rgba(185, 138, 60, 0.22)';

export default function SuccessClient({ orderId, provider, product, amount, productId, qty }) {
  const [order, setOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const numericId = Number(orderId);
      if (!numericId) {
        setStatusLoading(false);
        return;
      }
      try {
        const rows = await api.orders.getAll();
        const match = (rows || []).find((o) => Number(o.id) === numericId);
        if (!cancelled) setOrder(match || null);
      } catch {
        // Best-effort: if we can't reach the orders API, show the generic screen.
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // The order is already persisted in Supabase, so clear the local cart as
  // soon as a payment was actually initiated (not on explicit cancel/fail).
  useEffect(() => {
    if (order && order.payment_status !== 'failed' && order.payment_status !== 'canceled') {
      clearCart().catch(() => {});
    }
  }, [order, clearCart]);

  const paymentStatus = order?.payment_status;
  const isPaddle = !provider || provider === 'paddle';

  const paid = paymentStatus === 'paid';
  const failed = paymentStatus === 'failed';
  const canceled = paymentStatus === 'canceled';
  const refunded = paymentStatus === 'refunded';
  const pending = !statusLoading && !paid && !failed && !canceled && !refunded;

  const amountText = amount ? `$${Number(amount).toFixed(2)}` : null;

  const statusBadge = () => {
    if (statusLoading) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: panelBg, color: '#93692A' }}>
          <Loader className="w-3.5 h-3.5 animate-spin" /> Checking...
        </span>
      );
    }
    if (paid) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#EDF6EC', color: '#2E5B2E' }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Payment confirmed
        </span>
      );
    }
    if (refunded) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F0EAFD', color: '#6B46C1' }}>
          <Undo2 className="w-3.5 h-3.5" /> Refunded
        </span>
      );
    }
    if (failed) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F7E3DD', color: '#A12A2A' }}>
          <XCircle className="w-3.5 h-3.5" /> Payment failed
        </span>
      );
    }
    if (canceled) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8E2DC', color: '#7A6A4C' }}>
          <XCircle className="w-3.5 h-3.5" /> Canceled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F7EFDC', color: '#93692A' }}>
        <Clock className="w-3.5 h-3.5" /> Processing
      </span>
    );
  };

  const heading = paid
    ? 'Payment Successful'
    : refunded
      ? 'Payment Refunded'
      : failed
        ? 'Payment Failed'
        : canceled
          ? 'Payment Canceled'
          : 'We are confirming your payment';

  const message = paid
    ? 'Paddle has verified your payment. Our team will start preparing your order shortly.'
    : refunded
      ? 'This order has been refunded. The amount will be returned through your original payment method.'
      : failed
        ? 'Paddle could not complete your payment. No charge was made to your account.'
: canceled
        ? 'The payment was not completed. Your order is still open.'
        : 'Your payment is being confirmed by Paddle. This usually takes just a few seconds.';

  const canRetry = failed || canceled || pending;

  return (
    <main className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6" style={{ backgroundColor: cardBg }}>
      <div className="w-full max-w-lg">
        <div className="border overflow-hidden rounded-2xl" style={{ borderColor: goldSoft, backgroundColor: cardBg }}>
          <div className="p-8 text-center" style={{ backgroundColor: panelBg, borderBottom: `1px solid ${goldSoft}` }}>
            <div
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
              style={{
                backgroundColor: paid || refunded ? '#EDF6EC' : '#F7EFDC',
                color: paid ? '#2E5B2E' : refunded ? '#6B46C1' : '#93692A',
              }}
            >
              {paid ? <CheckCircle2 className="w-9 h-9" /> : refunded ? <Undo2 className="w-9 h-9" /> : <Clock className="w-9 h-9" />}
            </div>
            <h1 className="text-2xl font-bold" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>
              {heading}
            </h1>
            <p className="text-sm mt-2" style={{ color: tan }}>{message}</p>
            {isPaddle && (
              <p className="text-xs mt-2" style={{ color: tan }}>
                Secured by Paddle — Visa, Mastercard, PayPal, Apple Pay, Google Pay and more.
              </p>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div className="border rounded-xl divide-y" style={{ borderColor: goldSoft }}>
              {orderId && !statusLoading && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-medium" style={{ color: tan }}>Order Reference</span>
                  <span className="text-sm font-semibold font-mono" style={{ color: ink }}>
                    #ORD-{String(orderId).padStart(6, '0')}
                  </span>
                </div>
              )}
              {isPaddle && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-medium" style={{ color: tan }}>Payment Method</span>
                  <span className="text-sm font-semibold" style={{ color: ink }}>Paddle</span>
                </div>
              )}
              {product && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-medium" style={{ color: tan }}>Product</span>
                  <span className="text-sm font-semibold text-right line-clamp-1" style={{ color: ink }}>{product}</span>
                </div>
              )}
              {amountText && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-medium" style={{ color: tan }}>Total (USD)</span>
                  <span className="text-sm font-bold" style={{ color: goldDeep }}>${Number(amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-medium" style={{ color: tan }}>Payment Status</span>
                {statusBadge()}
              </div>
            </div>

            {(paid || refunded) && (
              <p className="text-xs leading-relaxed" style={{ color: tan }}>
                {paid
                  ? 'A confirmation email with your order reference will follow. You can track the order from your dashboard.'
                  : 'If you have questions about the refund, contact support.'}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {canRetry && productId && (
                <Link
                  href={`/checkout?product_id=${productId}&qty=${qty || 1}`}
                  className="gold-shimmer-btn flex-1 py-3 font-semibold text-center inline-flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </Link>
              )}
              {canRetry && !productId && (
                <Link
                  href="/checkout"
                  className="gold-shimmer-btn flex-1 py-3 font-semibold text-center inline-flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Return to Checkout
                </Link>
              )}
              <Link href="/orders" className="gold-shimmer-btn flex-1 py-3 font-semibold text-center">
                View My Orders
              </Link>
              <Link
                href="/products"
                className="flex-1 py-3 text-center text-sm font-semibold border-2 rounded-[4px] transition-colors hover:border-[#B8862E]/40"
                style={{ borderColor: goldSoft, color: goldDeep }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}