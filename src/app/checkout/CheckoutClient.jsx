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

const PADDLE_METHODS = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay', 'Google Pay'];

function getUnit(item) {
  return Math.round(Number(item.price_min || item.price || 0) * 100) / 100;
}

export default function CheckoutClient({ initialProductId, initialQty, initialCancelled }) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { cartItems, updateQty, removeFromCart } = useCart();

  const buyNowId = Number(initialProductId);
  const buyNow = Number.isInteger(buyNowId) && buyNowId > 0;
  const fromCart = !buyNow && cartItems.length > 0;

  const [singleProduct, setSingleProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [quantity, setQuantity] = useState(() => Math.min(1000, Math.max(1, Number(initialQty) || 1)));
  const [error, setError] = useState(initialCancelled ? 'You cancelled the payment. Please try again.' : '');

  useEffect(() => {
    if (!buyNow) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    setSingleProduct(null);
    (async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, image_url, price, price_min, price_max, category, slug')
          .eq('id', buyNowId)
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
  }, [buyNow, buyNowId]);

  const lines = useMemo(() => {
    if (buyNow) {
      if (!singleProduct) return [];
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
    return cartItems
      .map((item) => ({
        product_id: item.id,
        quantity: Math.min(1000, Math.max(1, Math.floor(Number(item.qty) || 1))),
        name: item.name || item.title,
        price: getUnit(item),
        image: item.image || item.image_url || '',
      }))
      .filter((l) => Number.isInteger(Number(l.product_id)) && Number(l.product_id) > 0);
  }, [buyNow, cartItems, singleProduct, quantity]);

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const amount = Math.round(lines.reduce((sum, l) => sum + Number(l.price) * l.quantity, 0) * 100) / 100;

  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center bg-white font-jost">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader className="w-5 h-5 animate-spin text-black" /> Reviewing your order...
        </div>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center p-6 bg-white font-jost">
        <div className="max-w-md w-full text-center space-y-4">
          <ShoppingBag className="w-12 h-12 mx-auto text-black" />
          <p className="text-sm text-gray-500">
            {loadError || 'Your cart is empty. Add products to your cart before checking out.'}
          </p>
          <Link href="/products" className="inline-block px-8 py-3 bg-black text-white font-semibold text-xs uppercase tracking-widest rounded-md hover:bg-neutral-800 transition-all">
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
    <main className="min-h-screen py-12 px-4 sm:px-6 md:px-8 bg-white font-jost pt-24 sm:pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <div>
            <h1 className="font-playfair font-bold text-3xl text-black">Core Collective Checkout</h1>
            <p className="text-xs text-gray-500 mt-1">
              Review your order items, enter delivery information, and complete payment securely.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Continue shopping
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-4 mb-6 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Order Review Details Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-black">
                  Order Items ({itemCount})
                </span>
                {fromCart && (
                  <span className="text-xs text-gray-500">{cartItems.length} items in cart</span>
                )}
              </div>

              <div className="divide-y divide-gray-100">
                {lines.map((line) => (
                  <div key={line.product_id} className="p-4 flex items-center gap-4">
                    {line.image ? (
                      <img
                        src={line.image}
                        alt={line.name}
                        className="w-16 h-16 rounded-lg border border-gray-200 object-cover shrink-0 bg-gray-50"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-playfair font-bold text-sm text-black truncate">{line.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">${Number(line.price).toFixed(2)} / unit</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => changeQty(line, line.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-black">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(line, line.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right pl-2">
                      <p className="font-bold text-sm text-black">
                        ${(Number(line.price) * line.quantity).toFixed(2)}
                      </p>
                      {fromCart && (
                        <button
                          type="button"
                          onClick={() => removeFromCart(line.product_id)}
                          className="text-red-500 hover:text-red-700 text-[11px] mt-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-black block">Account</span>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Lock className="w-3.5 h-3.5 text-black" />
                <span>{userProfile?.email || 'Not signed in'}</span>
              </div>
            </div>
          </div>

          {/* FASCO Right Column Summary & Payment Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FAF9F6] border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-playfair font-bold text-lg text-black">Order Summary</h3>

              <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-black">${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-700">Calculated at Checkout</span>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-bold text-black font-playfair">
                <span>Total Amount</span>
                <span>${amount.toFixed(2)}</span>
              </div>

              {!userProfile && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                  Please <Link href="/login?redirect=/checkout" className="font-bold underline">sign in</Link> to complete your order.
                </div>
              )}

              <div className="pt-2">
                <PaddleCheckout
                  disabled={!userProfile}
                  lines={lines}
                  onOpened={() => {}}
                  onError={(msg) => setError(msg)}
                />
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Encrypted 256-Bit SSL Payment Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}