'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import PaddleCheckout from '../../components/checkout/PaddleCheckout';

const palette = {
  creamBg: '#EFE3C8',
  panelBg: '#F7EFDC',
  cardBg: '#FBF5E8',
  ink: '#2B2013',
  tan: '#7A6A4C',
  goldDeep: '#8A6A1E',
  goldMid: '#B8862E',
  goldSoft: 'rgba(185, 138, 60, 0.22)',
};

const PADDLE_METHODS = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay', 'Google Pay'];

// Preview unit price only — the checkout API always re-derives prices from
// the products table (source of truth).
function getUnit(item) {
  return Math.round(Number(item.price_min || item.price || 0) * 100) / 100;
}

export default function CheckoutClient({ initialProductId, initialQty, initialCancelled }) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { cartItems, updateQty, removeFromCart } = useCart();

  const fromCart = cartItems.length > 0;

  const [singleProduct, setSingleProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [quantity, setQuantity] = useState(() => Math.min(1000, Math.max(1, Number(initialQty) || 1)));
  const [error, setError] = useState(initialCancelled ? 'You cancelled the payment. Please try again.' : '');

  // Buy Now mode: load the single product referenced by ?product_id.
  useEffect(() => {
    if (fromCart) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const id = Number(initialProductId);
      if (!Number.isInteger(id) || id <= 0) {
        setLoadError('You have no items to check out. Add products to your cart first.');
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, image_url, price, price_min, price_max, category, slug')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (!cancelled) setSingleProduct(data);
      } catch {
        if (!cancelled) setLoadError('Could not load this product. It may have been removed.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fromCart, initialProductId]);

  const lines = useMemo(() => {
    if (fromCart) {
      return cartItems
        .map((item) => ({
          product_id: item.id,
          quantity: Math.min(1000, Math.max(1, Math.floor(Number(item.qty) || 1))),
          name: item.name || item.title,
          price: getUnit(item),
          image: item.image || item.image_url || '',
        }))
        .filter((l) => Number.isInteger(Number(l.product_id)) && Number(l.product_id) > 0);
    }
    if (singleProduct) {
      return [
        {
          product_id: singleProduct.id,
          quantity,
          name: singleProduct.name,
          price: getUnit(singleProduct),
          image: singleProduct.image_url || '',
        },
      ];
    }
    return [];
  }, [fromCart, cartItems, singleProduct, quantity]);

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const amount = Math.round(lines.reduce((sum, l) => sum + Number(l.price) * l.quantity, 0) * 100) / 100;

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center" style={{ backgroundColor: palette.cardBg }}>
        <div className="flex items-center gap-3 text-sm" style={{ color: palette.tan }}>
          <Loader className="w-5 h-5 animate-spin" /> Reviewing your order...
        </div>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center p-6" style={{ backgroundColor: palette.cardBg }}>
        <div className="max-w-md w-full text-center space-y-4">
          <ShoppingBag className="w-10 h-10 mx-auto" style={{ color: palette.goldMid }} />
          <p className="text-sm" style={{ color: palette.tan }}>
            {loadError || 'Your cart is empty. Add products to your cart before checking out.'}
          </p>
          <Link href="/products" className="gold-shimmer-btn inline-block px-6 py-2.5 font-semibold">
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const changeQty = (line, next) => {
    const clamped = Math.min(1000, Math.max(1, Math.floor(Number(next) || 1)));
    if (fromCart) updateQty(line.product_id, clamped);
    else setQuantity(clamped);
  };

  return (
    <main className="min-h-[70vh] py-10 px-4 sm:px-6" style={{ backgroundColor: palette.cardBg }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: palette.ink, fontFamily: 'Fraunces, serif' }}>Checkout</h1>
            <p className="text-sm mt-1" style={{ color: palette.tan }}>
              Review your order, then pay securely through Paddle.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="flex items-center gap-1.5 text-sm hover:underline"
            style={{ color: palette.tan }}
          >
            <ArrowLeft className="w-4 h-4" /> Continue shopping
          </button>
        </div>

        {error && (
          <div
            className="flex items-start gap-2 p-3 mb-6 text-sm border rounded-lg"
            style={{ borderColor: 'rgba(161,42,42,0.4)', color: '#A12A2A', backgroundColor: '#F7E3DD' }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="border overflow-hidden rounded-2xl" style={{ borderColor: palette.goldSoft, backgroundColor: palette.cardBg }}>
            <div className="p-5 border-b" style={{ borderColor: palette.goldSoft, backgroundColor: palette.panelBg }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: palette.tan }}>
                Order Review {fromCart && `· ${cartItems.length} item${cartItems.length === 1 ? '' : 's'}`}
              </p>
            </div>

            <div className="divide-y" style={{ borderColor: palette.goldSoft }}>
              {lines.map((line) => (
                <div key={line.product_id} className="p-5 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 sm:items-center">
                  {line.image ? (
                    <img
                      src={line.image}
                      alt={line.name}
                      className="w-20 h-20 rounded-lg border object-cover flex-shrink-0"
                      style={{ borderColor: palette.goldSoft }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-lg border flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: palette.goldSoft }}
                    >
                      <CreditCard className="w-6 h-6" style={{ color: palette.tan }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold line-clamp-2" style={{ color: palette.ink }}>{line.name}</p>
                    <p className="text-sm mt-1 font-medium" style={{ color: palette.goldDeep }}>
                      ${Number(line.price).toFixed(2)} / unit
                    </p>
                  </div>
                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => changeQty(line, line.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center border rounded-lg hover:border-[#B8862E]/40 transition-colors"
                        style={{ borderColor: palette.goldSoft, color: palette.ink }}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={line.quantity}
                        onChange={(e) => changeQty(line, e.target.value)}
                        className="w-20 text-center border rounded-lg px-2 py-2 text-sm outline-none focus:border-[#B8862E]/50"
                        style={{ borderColor: palette.goldSoft, color: palette.ink, backgroundColor: '#fff' }}
                      />
                      <button
                        type="button"
                        onClick={() => changeQty(line, line.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center border rounded-lg hover:border-[#B8862E]/40 transition-colors"
                        style={{ borderColor: palette.goldSoft, color: palette.ink }}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold w-24 text-right" style={{ color: palette.ink }}>
                        ${(Number(line.price) * line.quantity).toFixed(2)}
                      </p>
                      {fromCart && (
                        <button
                          type="button"
                          onClick={() => removeFromCart(line.product_id)}
                          className="p-2 rounded-lg border transition-colors hover:border-red-400"
                          style={{ borderColor: palette.goldSoft, color: palette.tan }}
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: palette.tan }}>Billed to</label>
                <div
                  className="border rounded-lg px-3 py-2 text-sm flex items-center gap-2"
                  style={{ borderColor: palette.goldSoft, backgroundColor: palette.panelBg, color: palette.ink }}
                >
                  <Lock className="w-3.5 h-3.5" style={{ color: palette.goldMid }} />
                  {userProfile?.email ? userProfile.email : 'Not signed in'}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 flex items-center justify-between border-t" style={{ borderColor: palette.goldSoft, backgroundColor: palette.panelBg }}>
              <div>
                <p className="text-sm font-medium" style={{ color: palette.ink }}>Total (USD)</p>
                <p className="text-xs" style={{ color: palette.tan }}>{itemCount} item{itemCount === 1 ? '' : 's'} · prices confirmed at payment</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: palette.goldDeep, fontFamily: 'Fraunces, serif' }}>
                ${amount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {!userProfile && (
              <div className="flex items-start gap-2 p-3 text-sm border rounded-lg" style={{ borderColor: palette.goldSoft, color: '#93692A', backgroundColor: palette.panelBg }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  You need to be signed in to place an order.{' '}
                  <Link href="/login?redirect=/checkout" className="font-semibold underline">Log in</Link>
                </span>
              </div>
            )}

            <div className="border overflow-hidden rounded-2xl" style={{ borderColor: palette.goldSoft, backgroundColor: palette.cardBg }}>
              <div className="p-5 border-b" style={{ borderColor: palette.goldSoft, backgroundColor: palette.panelBg }}>
                <p className="text-sm font-semibold" style={{ color: palette.ink }}>Pay with Paddle</p>
                <p className="text-xs mt-0.5" style={{ color: palette.tan }}>
                  A secure Paddle checkout window opens for your payment.
                </p>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {PADDLE_METHODS.map((m) => (
                    <span key={m} className="text-[11px] font-medium px-2.5 py-1 border rounded-full" style={{ borderColor: palette.goldSoft, color: palette.tan }}>
                      {m}
                    </span>
                  ))}
                  <span className="text-[11px] text-xs" style={{ color: palette.tan }}>+ more via Paddle</span>
                </div>

                <PaddleCheckout
                  disabled={!userProfile}
                  lines={lines}
                  onOpened={() => {}}
                  onError={(msg) => setError(msg)}
                />

                <p className="flex items-start gap-1.5 text-xs leading-relaxed" style={{ color: palette.tan }}>
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: palette.goldMid }} />
                  Paddle handles all payment methods and card data. We never see your card details, stocks are reduced
                  only after Paddle verifies the payment, and your order is confirmed only by the verified webhook.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}