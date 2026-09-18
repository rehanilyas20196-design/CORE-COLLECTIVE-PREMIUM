'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, ShieldCheck, Truck, Lock, Send, Loader, ChevronLeft, ChevronRight, Heart, Eye, ShoppingBag, CheckCircle, AlertCircle, X, Check, ChevronUp, Clock, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { api } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import OptimizedProductImage from '../../../components/products/OptimizedProductImage';

const creamBg = '#EFE3C8';
const panelBg = '#F7EFDC';
const cardBg = '#FBF5E8';
const ink = '#2B2013';
const tan = '#7A6A4C';
const goldDeep = '#8A6A1E';
const goldMid = '#B8862E';
const goldSoft = 'rgba(185, 138, 60, 0.22)';
const borderGoldSoft = { borderColor: goldSoft };

const stockStatusConfig = {
  in_stock: { label: 'In Stock', color: '#9C7034' },
  limited: { label: 'Limited Stock', color: '#B8862E' },
  out_of_stock: { label: 'Out of Stock', color: '#A12A2A' },
};

function parseGallery(product) {
  const raw = product?.images;
  let arr = Array.isArray(raw)
    ? raw.filter(Boolean)
    : typeof raw === 'string'
      ? raw.split(',').filter(Boolean).map(s => s.trim())
      : [];
  arr = arr.slice(0, 4);
  if (arr.length === 0 && product?.image_url) arr = [product.image_url];
  return arr;
}

export default function ProductDetailPage({ params }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const { userProfile } = useAuth();
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyForm, setBuyForm] = useState({ quantity: 1, phone: '', message: '', address: '' });
  const [buyError, setBuyError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const [quoteForm, setQuoteForm] = useState({ name: '', business: '', phone: '', email: '', quantity: '', message: '' });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });
  const [wishlisted, setWishlisted] = useState(false);

useEffect(() => {
    fetchProduct();
  }, [params.id]);

  useEffect(() => {
    setActiveImage(0);
    setActiveTab('description');
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      if (!supabase) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', Number(params.id))
        .single();
      if (error) throw error;
      setProduct(data);

      if (supabase) {
        await supabase.from('products').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const galleryImages = parseGallery(product);
  const current = product ? Number(product.price_min || product.price || 0) : 0;
  const priceMax = product ? Number(product.price_max || product.price || current) : current;
  const hasRange = priceMax > current;
  const pricingTiers = product?.pricing_tiers || [];
  const rating = Number(product?.rating || 0);
  const reviews = Number(product?.reviews_count || product?.review_count || 0);
  const stock = product?.stock_status || (product?.stock > 0 ? 'in_stock' : 'out_of_stock');

  const handleGlow = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setGlow({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, active: true });
  };

  const handleBuySubmit = (e) => {
    e.preventDefault();
    if (!buyForm.phone) { setBuyError('Phone number is required'); return; }
    if (!buyForm.address) { setBuyError('Delivery address is required'); return; }
    setBuyError('');
    setShowPayment(true);
  };

  const handlePaymentConfirm = async () => {
    if (!paymentFile) { setBuyError('Please upload payment screenshot'); return; }
    setPaymentSubmitting(true);
    setBuyError('');
    try {
      const unitPrice = current;
      const qty = Number(buyForm.quantity) || 1;

      const uploadRes = await api.upload.paymentScreenshot(paymentFile);
      const screenshotUrl = uploadRes.url || uploadRes;

      await api.buyRequests.create({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url || '',
        quantity: qty,
        total_amount: qty * unitPrice,
        phone: buyForm.phone,
        address: buyForm.address,
        message: buyForm.message || '',
        user_name: userProfile?.name || '',
        user_email: userProfile?.email || '',
        payment_screenshot: screenshotUrl,
        payment_method: paymentMethod,
        payment_status: 'uploaded',
      });
      setPaymentDone(true);
    } catch (err) {
      setBuyError(err.message || 'Failed to submit payment');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.email || !quoteForm.quantity) return;
    setQuoteSubmitting(true);
    setQuoteError('');

    try {
      await api.quotes.create({
        product_id: product.id,
        buyer_name: quoteForm.name,
        business_name: quoteForm.business,
        phone: quoteForm.phone,
        email: quoteForm.email,
        quantity: Number(quoteForm.quantity),
        message: quoteForm.message,
      });
      setQuoteSent(true);
    } catch (err) {
      setQuoteError(err.message || 'Failed to send quote request');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: creamBg }}>
        <div className="max-w-[1180px] mx-auto px-4 py-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border border-[rgba(185,138,60,0.3)] animate-pulse bg-[#F7EFDC]" />
            <div className="h-4 w-48 mx-auto bg-[#D9C49A] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: creamBg }}>
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-[#B8862E]" />
          <h2 className="text-xl font-bold mb-2" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>Product not found</h2>
          <button onClick={() => router.push('/products')} className="text-[#93692A] hover:underline">Browse all products</button>
        </div>
      </div>
    );
  }

  const origin = 'https://buy-allproduts-corecollective.vercel.app';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.substring(0, 200),
    image: product.image_url || undefined,
    sku: `CC-${product.id}`,
    mpn: `CC-${product.id}`,
    brand: { '@type': 'Brand', name: product.supplier_name || 'Core Collective' },
    offers: {
      '@type': 'Offer',
      url: `${origin}/products/${product.id}`,
      priceCurrency: 'PKR',
      price: current,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: stock === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewsCount: reviews,
    } : undefined,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${origin}/products` },
      { '@type': 'ListItem', position: 3, name: product.category || 'Product', item: `${origin}/products?category=${encodeURIComponent(product.category || '')}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `${origin}/products/${product.id}` },
    ],
  };

return (
    <div className="min-h-screen pt-[84px] sm:pt-[96px] md:pt-[100px]" style={{ backgroundColor: creamBg }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <div className="max-w-[1180px] mx-auto px-4 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-sm flex-wrap" style={{ color: tan }} aria-label="Breadcrumb">
          <button onClick={() => router.push('/')} className="hover:text-[#93692A] transition-colors">Home</button>
          <ChevronDown className="w-3 h-3 -rotate-90" style={{ color: goldMid }} />
          <button onClick={() => router.push('/products')} className="hover:text-[#93692A] transition-colors">Products</button>
          <ChevronDown className="w-3 h-3 -rotate-90" style={{ color: goldMid }} />
          <span className="truncate max-w-[240px]" style={{ color: '#93692A' }}>{product.name}</span>
        </nav>
      </div>

      {/* Hero: gallery (left) + info (right) */}
      <div className="max-w-[1180px] mx-auto px-4 py-6 grid grid-cols-1 items-start gap-10 desktop:grid-cols-2">
{/* Left: gallery */}
        <div className="space-y-4">
          <div className="gold-border-frame relative cursor-crosshair" onMouseMove={handleGlow} onMouseLeave={() => setGlow(g => ({ ...g, active: false }))}>
            <div className="relative aspect-square w-full overflow-hidden" style={{ backgroundColor: panelBg }}>
              {galleryImages.length > 0 ? (
                <OptimizedProductImage
                  src={galleryImages[activeImage % galleryImages.length]}
                  alt={product.name}
                  sizes="(max-width: 720px) 100vw, 50vw"
                  classN="object-cover"
                  priority
                  onError={e => { if (e.currentTarget.src !== (product.image_url || '')) e.currentTarget.src = product.image_url || ''; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-16 h-16" style={{ color: goldMid }} /></div>
              )}

              {/* subtle gold glow that follows the cursor */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: glow.active ? 1 : 0,
                  background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(217,166,60,0.22) 0%, transparent 55%)`,
                }}
              />

              {/* heart */}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center border bg-[#FBF5E8]/90 hover:bg-[#FBF5E8] transition-colors"
                style={{ borderColor: goldSoft, color: '#93692A' }}
                aria-label="Toggle favorites"
              >
                <Heart className={`w-5 h-5 transition-colors ${wishlisted ? 'fill-[#D9A63C] text-[#D9A63C]' : ''}`} />
              </button>

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#2B2013]/50 hover:bg-[#2B2013]/75 text-[#FBF5E8] transition-colors"
                    style={{ borderColor: goldSoft }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage(i => (i + 1) % galleryImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#2B2013]/50 hover:bg-[#2B2013]/75 text-[#FBF5E8] transition-colors"
                    style={{ borderColor: goldSoft }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

{/* thumbnails (4) */}
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square overflow-hidden border-2 transition-all duration-200 ${
                    i === activeImage ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: panelBg,
                    borderColor: i === activeImage ? goldMid : goldSoft,
                    outline: i === activeImage ? `2px solid ${creamBg}` : 'none',
                    outlineOffset: 2,
                  }}
                  aria-label={`Image ${i + 1}`}
                >
                  <OptimizedProductImage src={img} alt={`${product.name} - view ${i + 1}`} sizes="96px" classN="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {product.category && (
              <span className="px-3 py-1 text-[11px] uppercase tracking-wider border" style={{ borderColor: goldSoft, color: goldDeep, backgroundColor: panelBg }}>
                {product.category}
              </span>
            )}
            {product.is_verified && (
              <span className="px-3 py-1 text-[11px] uppercase tracking-wider flex items-center gap-1.5 border" style={{ borderColor: goldSoft, color: goldDeep, backgroundColor: cardBg }}>
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Supplier
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>
            {product.name}
          </h1>

          <div className="flex items-center gap-5 flex-wrap text-sm" style={{ color: tan }}>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'fill-[#D9A63C] text-[#D9A63C]' : 'text-[#C4B08A]'}`} />
                ))}
              </div>
              <span className="font-semibold" style={{ color: goldDeep }}>{rating || '—'}</span>
              <span>({reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> {product.views || 0} views
            </div>
          </div>

          {/* Price */}
          <div style={{ backgroundColor: panelBg, borderColor: goldSoft }} className="border p-6 space-y-3">
            <p className="text-xs uppercase tracking-widest" style={{ color: tan }}>Price</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-gold-gradient text-4xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
                PKR {current.toLocaleString()}
              </span>
              {hasRange && (
                <span className="text-xl font-semibold" style={{ color: '#93692A', fontFamily: 'Fraunces, serif' }}>
                  – PKR {priceMax.toLocaleString()}
                </span>
              )}
              <span className="text-sm" style={{ color: tan }}>/ unit</span>
            </div>

            {product.moq > 1 && (
              <p className="text-sm" style={{ color: tan }}>
                Min. Order: <span className="font-semibold" style={{ color: ink }}>{product.moq} units</span>
              </p>
            )}

            {/* stock status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stockStatusConfig[stock]?.color || goldMid }} />
              <span className="font-medium" style={{ color: stockStatusConfig[stock]?.color || ink }}>
                {stockStatusConfig[stock]?.label || 'In Stock'}
              </span>
            </div>
          </div>

          {/* Bulk pricing tiers */}
          {pricingTiers.length > 0 && (
            <div className="border" style={{ borderColor: goldSoft, backgroundColor: cardBg }}>
              <p className="px-5 pt-4 text-xs uppercase tracking-widest font-medium" style={{ color: tan }}>Bulk Pricing Tiers</p>
              <div className="p-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider" style={{ color: tan }}>
                      <th className="pb-2 font-medium">Order Qty</th>
                      <th className="pb-2 font-medium">Price / Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingTiers.map((tier, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: goldSoft }}>
                        <td className="py-2.5" style={{ color: ink }}>{tier.qty_from}–{tier.qty_to || '∞'} units</td>
                        <td className="py-2.5 font-semibold" style={{ color: goldDeep, fontFamily: 'Fraunces, serif' }}>
                          PKR {Number(tier.price_per_unit || tier.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Buy Now */}
          <button
            onClick={() => setBuyModalOpen(true)}
            className="gold-shimmer-btn w-full flex items-center justify-center gap-2 py-4 text-base font-semibold transition-transform duration-200 active:scale-[0.99]"
          >
            <ShoppingCart className="w-5 h-5" /> Buy Now
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { icon: ShieldCheck, label: 'Verified Supplier' },
              { icon: Truck, label: 'Fast Delivery' },
              { icon: Lock, label: 'Secure Payment' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 border py-4 px-2 text-center" style={{ borderColor: goldSoft, backgroundColor: cardBg }}>
                <Icon className="w-5 h-5" style={{ color: goldDeep }} />
                <span className="text-[11px] leading-tight" style={{ color: tan }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-[1180px] mx-auto px-4 mt-10">
        <div className="flex border-b overflow-x-auto no-scrollbar" style={{ borderColor: goldSoft }}>
          {['description', 'specifications', 'shipping', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 text-sm font-medium capitalize transition-all whitespace-nowrap border-b-2 -mb-[1px]"
              style={{
                color: activeTab === tab ? goldDeep : tan,
                borderColor: activeTab === tab ? goldMid : 'transparent',
                fontFamily: activeTab === tab ? 'Fraunces, serif' : 'inherit',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            {activeTab === 'description' && (
              <div className="max-w-3xl leading-relaxed whitespace-pre-line" style={{ color: ink }}>{product.description}</div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-2xl border" style={{ borderColor: goldSoft, backgroundColor: cardBg }}>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, val], i) => (
                        <tr key={i} className="border-b last:border-0" style={{ borderColor: goldSoft, backgroundColor: i % 2 === 0 ? cardBg : panelBg }}>
                          <td className="px-5 py-3.5 font-medium capitalize" style={{ color: ink }}>{String(key).replace(/_/g, ' ')}</td>
                          <td className="px-5 py-3.5" style={{ color: tan }}>{String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="p-6" style={{ color: tan }}>No specifications available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-2xl space-y-4">
                <div className="border p-6" style={{ borderColor: goldSoft, backgroundColor: cardBg }}>
                  <h4 className="font-semibold mb-3" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>Delivery & Shipping</h4>
                  <ul className="space-y-2.5 text-sm" style={{ color: tan }}>
                    <li className="flex items-start gap-2.5"><Truck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: goldMid }} /> Delivery across all major cities in Pakistan</li>
                    <li className="flex items-start gap-2.5"><Truck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: goldMid }} /> Estimated delivery: 3–7 business days</li>
                    <li className="flex items-start gap-2.5"><Truck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: goldMid }} /> International shipping available on request</li>
                  </ul>
                </div>
                <div className="border p-6" style={{ borderColor: goldSoft, backgroundColor: cardBg }}>
                  <h4 className="font-semibold mb-2" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>Payment Methods</h4>
                  <p className="text-sm" style={{ color: tan }}>Bank Transfer, JazzCash, EasyPaisa, and Credit/Debit Cards</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewSection productId={product.id} rating={rating} reviewsCount={reviews} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quote + Related */}
      <div className="max-w-[1180px] mx-auto px-4 pb-16 grid grid-cols-1 desktop:grid-cols-12 gap-10 mt-4">
        {/* Quote form */}
        <div className="desktop:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border p-7 desktop:sticky desktop:top-8"
            style={{ borderColor: goldSoft, backgroundColor: cardBg }}
          >
            {quoteSent ? (
              <div className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 mx-auto mb-4 border flex items-center justify-center" style={{ borderColor: goldSoft }}>
                  <CheckCircle className="w-8 h-8" style={{ color: goldMid }} />
                </motion.div>
                <h3 className="text-lg font-bold mb-2" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>Quote Request Sent!</h3>
                <p className="text-sm mb-4" style={{ color: tan }}>The supplier will respond within 24 hours.</p>
                <button onClick={() => { setQuoteSent(false); setQuoteForm({ name: '', business: '', phone: '', email: '', quantity: '', message: '' }); }} className="text-sm text-[#93692A] hover:underline">
                  Send another request
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-1" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>Request a Quote</h3>
                <p className="text-sm mb-6" style={{ color: tan }}>Get a custom quote for bulk orders</p>
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Full Name *</label>
                      <input type="text" value={quoteForm.name} onChange={e => setQuoteForm(p => ({ ...p, name: e.target.value }))} required
                        className="w-full px-3.5 py-2.5 text-sm outline-none border bg-white transition-colors focus:border-[#B8862E]"
                        style={{ borderColor: goldSoft, color: ink }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Business Name</label>
                      <input type="text" value={quoteForm.business} onChange={e => setQuoteForm(p => ({ ...p, business: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm outline-none border bg-white transition-colors focus:border-[#B8862E]"
                        style={{ borderColor: goldSoft, color: ink }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Phone *</label>
                      <input type="tel" value={quoteForm.phone} onChange={e => setQuoteForm(p => ({ ...p, phone: e.target.value }))} required
                        className="w-full px-3.5 py-2.5 text-sm outline-none border bg-white transition-colors focus:border-[#B8862E]"
                        style={{ borderColor: goldSoft, color: ink }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Email *</label>
                      <input type="email" value={quoteForm.email} onChange={e => setQuoteForm(p => ({ ...p, email: e.target.value }))} required
                        className="w-full px-3.5 py-2.5 text-sm outline-none border bg-white transition-colors focus:border-[#B8862E]"
                        style={{ borderColor: goldSoft, color: ink }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Quantity (min. {product.moq || 1})</label>
                    <input type="number" min={product.moq || 1} value={quoteForm.quantity} onChange={e => setQuoteForm(p => ({ ...p, quantity: e.target.value }))} required
                      className="w-full px-3.5 py-2.5 text-sm outline-none border bg-white transition-colors focus:border-[#B8862E]"
                      style={{ borderColor: goldSoft, color: ink }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Message (optional)</label>
                    <textarea rows={3} value={quoteForm.message} onChange={e => setQuoteForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Any specific requirements..."
                      className="w-full px-3.5 py-2.5 text-sm outline-none border bg-white transition-colors focus:border-[#B8862E] resize-none"
                      style={{ borderColor: goldSoft, color: ink }} />
                  </div>
                  {quoteError && (
                    <div className="flex items-center gap-2 p-3 text-sm border" style={{ borderColor: 'rgba(161,42,42,0.4)', color: '#A12A2A', backgroundColor: '#F7E3DD' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {quoteError}
                    </div>
                  )}
                  <button type="submit" disabled={quoteSubmitting}
                    className="gold-shimmer-btn w-full py-3.5 font-semibold flex items-center justify-center gap-2 transition-transform duration-200 active:scale-[0.99] disabled:opacity-50">
                    {quoteSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {quoteSubmitting ? 'Sending...' : 'Request Quote'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>

        {/* Similar products */}
        <div className="desktop:col-span-7">
          <h3 className="text-xl font-bold mb-5" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>Similar Products</h3>
          <RelatedProducts category={product.category} currentId={product.id} currentName={product.name} />
        </div>
      </div>

      {/* Buy modal */}
      <AnimatePresence>
        {buyModalOpen && (
          <BuyRequestModal
            product={product}
            form={buyForm}
            setForm={setBuyForm}
            error={buyError}
            onClose={() => { setBuyModalOpen(false); setBuyError(''); setShowPayment(false); setPaymentFile(null); setPaymentDone(false); setBuyForm({ quantity: 1, phone: '', message: '', address: '' }); setPaymentMethod('easypaisa'); }}
            onSubmit={handleBuySubmit}
            user={userProfile}
            showPayment={showPayment}
            paymentFile={paymentFile}
            setPaymentFile={setPaymentFile}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentSubmitting={paymentSubmitting}
            paymentDone={paymentDone}
            onPaymentConfirm={handlePaymentConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewSection({ productId, rating, reviewsCount }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from('reviews').select('*').eq('product_id', productId).eq('is_approved', true)
      .then(({ data }) => { setReviews(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  const star = (v) => (
    <Star key={v} className={`w-4 h-4 ${v <= Math.round(rating || 0) ? 'fill-[#D9A63C] text-[#D9A63C]' : 'text-[#C4B08A]'}`} />
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>{rating || '—'}</span>
          <div>
            <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map(star)}</div>
            <p className="text-xs mt-1" style={{ color: tan }}>{reviewsCount || 0} reviews</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-24 border animate-pulse" style={{ ...borderGoldSoft, backgroundColor: panelBg }} />
      ) : reviews.length === 0 ? (
        <p className="text-sm" style={{ color: tan }}>No reviews yet. Be the first to review this product.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div key={review.id || i} className="border p-5" style={{ borderColor: goldSoft, backgroundColor: cardBg }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center text-xs font-bold border" style={{ borderColor: goldSoft, color: goldDeep, backgroundColor: panelBg }}>
                    {(review.buyer_name || 'U')[0]}
                  </div>
                  <span className="text-sm font-medium" style={{ color: ink }}>{review.buyer_name || 'Anonymous'}</span>
                </div>
                <div className="flex gap-0.5" style={{ color: goldMid }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= (Number(review.rating) || 0) ? 'fill-[#D9A63C] text-[#D9A63C]' : 'text-[#C4B08A]'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: ink }}>{review.comment}</p>
              <p className="text-xs mt-2" style={{ color: tan }}>{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedProducts({ category, currentId, currentName }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) { setLoading(false); return; }
    supabase.from('products').select('*')
      .eq('category', category).eq('is_active', true).eq('status', 'active')
      .not('id', 'eq', currentId)
      .not('name', 'eq', currentName)
      .limit(6)
      .then(({ data }) => {
        if (!cancelled) setProducts(data || []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category, currentId, currentName]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-3 gap-5">
        {[0, 1, 2].map(i => (
          <div key={i} className="border border-[rgba(185,138,60,0.3)] animate-pulse" style={{ backgroundColor: panelBg }}>
            <div className="aspect-[4/3]" />
            <div className="h-12 p-4" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) return <p className="text-sm" style={{ color: tan }}>No similar products found in this category.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-3 gap-5">
      {products.map((p, i) => <RelatedCard key={p.id} product={p} index={i} />)}
    </div>
  );
}

function RelatedCard({ product, index }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const p = product;
  const category = p.category || 'General';
  const current = Number(p.price_min || p.price || 0);
  const rating = Number(p.rating || 0);
  const reviews = Number(p.reviews_count || p.review_count || 0);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="h-full"
    >
<Link
        href={`/products/${p.id}`}
        className="group relative flex flex-col h-full border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_-16px_rgba(42,35,24,0.35)]"
        style={{ borderColor: goldSoft, backgroundColor: cardBg }}
      >
        <div className="relative aspect-square overflow-hidden w-full" style={{ backgroundColor: panelBg }}>
{!imgError && p.image_url ? (
            <OptimizedProductImage
              src={p.image_url}
              alt={p.name}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              classN="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12" style={{ color: goldMid }} />
            </div>
          )}

          <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider border"
            style={{ borderColor: goldSoft, color: goldDeep, backgroundColor: 'rgba(251,245,232,0.92)' }}>
            {category}
          </span>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-[15px] font-semibold leading-snug line-clamp-1" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>
            {p.name}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'fill-[#D9A63C] text-[#D9A63C]' : 'text-[#C4B08A]'}`} />
              ))}
            </div>
            <span style={{ color: tan }}>({reviews})</span>
          </div>

          <div className="mt-2.5 flex-1">
            <span className="text-lg font-semibold text-gold-gradient" style={{ fontFamily: 'Fraunces, serif' }}>
              PKR {current.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`mt-3 w-full py-2.5 text-[13px] font-medium flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] border ${
              added ? 'text-[#93692A]' : 'text-[#FBF5E8]'
            }`}
            style={{
              borderColor: goldSoft,
              backgroundColor: added ? panelBg : ink,
              color: added ? '#93692A' : '#FBF5E8',
            }}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {added ? 'Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}

function BuyRequestModal({ product, form, setForm, error, onClose, onSubmit, user, showPayment, paymentFile, setPaymentFile, paymentMethod, setPaymentMethod, paymentSubmitting, paymentDone, onPaymentConfirm }) {
  const update = (key) => (value) => setForm(p => ({ ...p, [key]: value }));
  const scrollRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const fileInputRef = useRef(null);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 5);
    setCanScrollDown(el.scrollTop < el.scrollHeight - el.clientHeight - 5);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: dir === 'up' ? -180 : 180, behavior: 'smooth' });
  };

  const inputCls = "w-full px-3.5 py-2.5 bg-white border text-sm outline-none transition-colors focus:border-[#B8862E]";
  const inputStyle = { borderColor: goldSoft, color: ink };

  const paymentOptions = [
    { id: 'easypaisa', label: 'EasyPaisa', details: '+92 345 5900229', logo: 'https://static.cdnlogo.com/logos/e/80/easypaisa.svg' },
    { id: 'jazzcash', label: 'JazzCash', details: '+92 345 5900229', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/JazzCash_logo_%282025%29.png' },
    { id: 'hbl', label: 'HBL Bank', details: 'Account: 0012-3456789012\nIBAN: PK36 HABB 0012 3456 7890 1234', logo: 'https://static.cdnlogo.com/logos/h/55/hbl.svg' },
  ];

  const panelCls = "bg-[#FBF5E8] border w-full max-w-md mx-4 shadow-2xl";
  const panelStyle = { borderColor: goldSoft };

  const closeBtn = (
    <button onClick={onClose} className="p-1.5 transition-colors hover:bg-[#EFE3C8]" aria-label="Close">
      <X className="w-4 h-4" style={{ color: tan }} />
    </button>
  );

  if (paymentDone) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          onClick={e => e.stopPropagation()} className={`${panelCls} p-7 text-center`} style={panelStyle}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: panelBg, color: '#B8862E' }}>
            <Clock className="w-8 h-8" />
          </motion.div>
          <h3 className="text-lg font-bold mb-2" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>Request Submitted!</h3>
          <p className="text-sm mb-2" style={{ color: tan }}>Please wait for <span className="font-semibold" style={{ color: ink }}>5 hours</span> to confirm or reject your order.</p>
          <p className="text-xs mb-6" style={{ color: tan }}>The admin will review your payment proof and update the status.</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onClose} className="gold-shimmer-btn px-8 py-2.5 font-semibold">
            Done
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (showPayment) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          onClick={e => e.stopPropagation()} className={`${panelCls} p-7`} style={panelStyle}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center border" style={{ borderColor: goldSoft, color: goldDeep, backgroundColor: panelBg }}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>Make Payment</h3>
                <p className="text-xs line-clamp-1" style={{ color: tan }}>{product.name}</p>
              </div>
            </div>
            {closeBtn}
          </div>

          <div className="space-y-4">
            <div className="border p-4 text-sm" style={{ borderColor: goldSoft, backgroundColor: panelBg }}>
              <p className="font-semibold mb-2" style={{ color: goldDeep }}>
                Total Amount: PKR {((Number(form.quantity) || 1) * (product.price_min || product.price || 0)).toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: tan }}>Send payment to any of the options below and upload the screenshot.</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: tan }}>Payment Options</p>
              {paymentOptions.map((opt) => (
                <div key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className="flex items-center gap-3 p-3.5 border-2 cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: paymentMethod === opt.id ? goldMid : goldSoft,
                    backgroundColor: paymentMethod === opt.id ? panelBg : cardBg,
                  }}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 flex items-center justify-center bg-white border p-1.5 overflow-hidden shrink-0" style={{ borderColor: goldSoft }}>
                      <img src={opt.logo} alt={opt.label} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: ink }}>{opt.label}</p>
                      <p className="text-xs whitespace-pre-line" style={{ color: tan }}>{opt.details}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200`}
                    style={{ borderColor: paymentMethod === opt.id ? goldMid : '#C4B08A' }}>
                    {paymentMethod === opt.id && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: goldMid }} />}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tan }}>Upload Payment Screenshot *</p>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed p-6 text-center cursor-pointer transition-colors hover:border-[#B8862E]"
                style={{ borderColor: goldSoft, backgroundColor: cardBg }}>
                {paymentFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 mx-auto" style={{ color: goldMid }} />
                    <p className="text-sm font-medium" style={{ color: ink }}>{paymentFile.name}</p>
                    <p className="text-xs" style={{ color: tan }}>{(paymentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setPaymentFile(null); }}
                      className="text-xs text-[#A12A2A] hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 mx-auto flex items-center justify-center" style={{ backgroundColor: panelBg, color: tan }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: ink }}>Click to upload</p>
                    <p className="text-xs" style={{ color: tan }}>PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setPaymentFile(f); }} />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm border" style={{ borderColor: 'rgba(161,42,42,0.4)', color: '#A12A2A', backgroundColor: '#F7E3DD' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={onPaymentConfirm} disabled={paymentSubmitting || !paymentFile}
              className="gold-shimmer-btn w-full py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-transform duration-200 active:scale-[0.99]">
              {paymentSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {paymentSubmitting ? 'Submitting...' : 'Confirm Payment'}
            </button>

            <button onClick={onClose} className="w-full py-2.5 text-sm transition-colors hover:underline" style={{ color: tan }}>
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="relative p-7" style={{ ...panelStyle, backgroundColor: cardBg }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center border" style={{ borderColor: goldSoft, color: goldDeep, backgroundColor: panelBg }}>
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: ink, fontFamily: 'Fraunces, serif' }}>Buy Product</h3>
              <p className="text-xs line-clamp-1" style={{ color: tan }}>{product.name}</p>
            </div>
          </div>
          {closeBtn}
        </div>

        <div className="relative">
          {canScrollUp && (
            <button type="button" onClick={() => scroll('up')}
              className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 w-9 h-9 flex items-center justify-center border shadow-lg hover:border-[#B8862E]/40 transition-colors"
              style={{ borderColor: goldSoft, backgroundColor: cardBg, color: tan }}>
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto scroll-smooth space-y-4 pr-1 -mr-1">
            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Your Name</label>
                  <input type="text" value={user?.name || ''} disabled className={`${inputCls} bg-[#EFE3C8] cursor-not-allowed`} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Email</label>
                  <input type="email" value={user?.email || ''} disabled className={`${inputCls} bg-[#EFE3C8] cursor-not-allowed`} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone')(e.target.value)} required
                    placeholder="+92 300 000 0000" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Delivery Address *</label>
                  <textarea value={form.address} onChange={e => update('address')(e.target.value)} required rows={2}
                    placeholder="Street, city, province..." className={`${inputCls} resize-none`} style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Quantity</label>
                    <input type="number" min="1" value={form.quantity} onChange={e => update('quantity')(e.target.value)} className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Unit Price</label>
                    <input type="text" value={`PKR ${(product.price_min || product.price || 0).toLocaleString()}`} disabled
                      className={`${inputCls} bg-[#EFE3C8] cursor-not-allowed`} style={inputStyle} />
                  </div>
                </div>
                {Number(form.quantity) > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 border" style={{ borderColor: goldSoft, backgroundColor: panelBg }}>
                    <span className="text-sm font-medium" style={{ color: ink }}>Total Amount</span>
                    <span className="text-lg font-bold text-gold-gradient" style={{ fontFamily: 'Fraunces, serif' }}>
                      PKR {((Number(form.quantity) || 1) * (product.price_min || product.price || 0)).toLocaleString()}
                    </span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: tan }}>Message (optional)</label>
                  <textarea rows={3} value={form.message} onChange={e => update('message')(e.target.value)}
                    placeholder="Any specific requirements or notes..." className={`${inputCls} resize-none`} style={inputStyle} />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm border" style={{ borderColor: 'rgba(161,42,42,0.4)', color: '#A12A2A', backgroundColor: '#F7E3DD' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                {!user && (
                  <div className="flex items-center gap-2 p-3 text-sm border" style={{ borderColor: goldSoft, color: '#93692A', backgroundColor: panelBg }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> Please log in to submit a purchase request
                  </div>
                )}

                <button type="submit" disabled={!user}
                  className="gold-shimmer-btn w-full py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-transform duration-200 active:scale-[0.99]">
                  <ShoppingCart className="w-4 h-4" />
                  Submit Purchase Request
                </button>
              </div>
            </form>
          </div>
          {canScrollDown && (
            <button type="button" onClick={() => scroll('down')}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 w-9 h-9 flex items-center justify-center border shadow-lg hover:border-[#B8862E]/40 transition-colors"
              style={{ borderColor: goldSoft, backgroundColor: cardBg, color: tan }}>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
