'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, ShieldCheck, Truck, Lock, Send, Loader, ChevronLeft, ChevronRight, Heart, Eye, ShoppingBag, CheckCircle, AlertCircle, Check, ShoppingCart, Award, Factory } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { api } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import OptimizedProductImage from '../../../components/products/OptimizedProductImage';

const creamBg = '#FFFFFF';
const panelBg = '#FAF9F6';
const cardBg = '#FFFFFF';
const ink = '#000000';
const tan = '#666666';
const goldDeep = '#000000';
const goldMid = '#000000';
const goldSoft = '#E5E7EB';
const borderGoldSoft = { borderColor: goldSoft };

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const stockStatusConfig = {
  in_stock: { label: 'In Stock', color: '#16A34A' },
  limited: { label: 'Limited Stock', color: '#D97706' },
  out_of_stock: { label: 'Out of Stock', color: '#DC2626' },
};

function parseGallery(product) {
  const raw = product?.images;
  let arr = Array.isArray(raw)
    ? raw.filter(Boolean)
    : typeof raw === 'string'
      ? raw.split(',').filter(Boolean).map(s => s.trim())
      : [];
  // Main image always comes first, then up to 3 gallery images (no duplicates).
  const main = product?.image_url ? String(product.image_url).trim() : '';
  const gallery = arr.filter(src => src !== main);
  arr = (main ? [main] : []).concat(gallery).slice(0, 4);
  return arr;
}

export default function ProductDetailPage({ params }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

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
  const listPrice = priceMax > current ? priceMax : null;
  const savingsPct = listPrice ? Math.round((1 - current / listPrice) * 100) : null;
  const pricingTiers = product?.pricing_tiers || [];
  const rating = Number(product?.rating || 0);
  const reviews = Number(product?.reviews_count || product?.review_count || 0);
  const stock = product?.stock_status || (product?.stock > 0 ? 'in_stock' : 'out_of_stock');

  const handleGlow = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setGlow({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, active: true });
  };

  const scrollToQuote = () => document.getElementById('request-quote')?.scrollIntoView({ behavior: 'smooth' });

  const waLink = `https://wa.me/923101515568?text=${encodeURIComponent(`Hi, I'm interested in buying: ${product?.name || 'this product'}`)}`;

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
        <div className="max-w-[1400px] mx-auto px-4 py-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 animate-pulse rounded-2xl" />
            <div className="h-4 w-48 mx-auto bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: creamBg }}>
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-volkhov font-bold mb-2 text-black">Product not found</h2>
          <button onClick={() => router.push('/products')} className="text-black underline underline-offset-4 hover:opacity-70">Browse all products</button>
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
      priceCurrency: 'USD',
      price: current.toFixed(2),
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

  const watermarkText = product.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').slice(0, 2).join(' ');

  return (
    <div className="min-h-screen pt-24 sm:pt-28" style={{ backgroundColor: creamBg }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-sm flex-wrap text-gray-500" aria-label="Breadcrumb">
          <button onClick={() => router.push('/')} className="hover:text-black transition-colors">Home</button>
          <ChevronDown className="w-3 h-3 -rotate-90 text-gray-400" />
          <button onClick={() => router.push('/products')} className="hover:text-black transition-colors">Products</button>
          <ChevronDown className="w-3 h-3 -rotate-90 text-gray-400" />
          <span className="truncate max-w-[240px] text-black">{product.name}</span>
        </nav>
      </div>

      {/* Editorial hero: gallery + info on #FAF9F6 band with ghost watermark */}
      <section className="relative overflow-hidden border-b border-gray-100" style={{ backgroundColor: panelBg }}>
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block select-none max-w-[60%] overflow-hidden">
          <span className="block font-volkhov italic font-bold text-[9rem] leading-none text-black/[0.04] whitespace-nowrap uppercase pl-4">
            {watermarkText || 'Core Collective'}
          </span>
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 py-10 grid grid-cols-1 items-start gap-10 desktop:grid-cols-12">
          {/* Left: gallery */}
          <div className="desktop:col-span-6 space-y-4">
            <div className="relative cursor-crosshair" onMouseMove={handleGlow} onMouseLeave={() => setGlow(g => ({ ...g, active: false }))}>
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
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
                  <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-16 h-16 text-gray-300" /></div>
                )}

                {/* subtle black glow that follows the cursor */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: glow.active ? 1 : 0,
                    background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(0,0,0,0.06) 0%, transparent 55%)`,
                  }}
                />

                {/* rating badge */}
                {rating > 0 && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-sm pl-3">
                    <Star className="w-3.5 h-3.5 fill-black text-black" />
                    <span className="text-xs font-bold text-black">{rating}</span>
                    <span className="text-xs text-gray-500">({reviews})</span>
                  </div>
                )}

                {/* heart */}
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-sm hover:bg-white transition-colors text-black"
                  aria-label="Toggle favorites"
                >
                  <Heart className={`w-5 h-5 transition-colors ${wishlisted ? 'fill-black text-black' : 'text-gray-600'}`} />
                </button>

                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImage(i => (i + 1) % galleryImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
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
                    className={`relative aspect-square overflow-hidden rounded-xl border transition-all duration-200 ${
                      i === activeImage ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: cardBg,
                      borderColor: i === activeImage ? ink : '#E5E7EB',
                      outline: i === activeImage ? '3px solid #FFFFFF' : 'none',
                      outlineOffset: 2,
                      boxShadow: i === activeImage ? '0 0 0 1px #000' : 'none',
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
          <div className="desktop:col-span-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] border border-gray-200 text-black rounded-full bg-white">
                  {product.category}
                </span>
              )}
              {product.is_verified && (
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5 border border-gray-200 text-black rounded-full bg-white">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Supplier
                </span>
              )}
            </div>

            <h1 className="font-volkhov font-bold text-3xl sm:text-5xl leading-tight text-black">
              {product.name}
            </h1>

            <div className="flex items-center gap-5 flex-wrap text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'fill-black text-black' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-semibold text-black">{rating || 'â€”'}</span>
                <span>({reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {product.views || 0} views
              </div>
            </div>

            {product.description && (
              <p className="leading-relaxed text-gray-600 line-clamp-2 max-w-xl">
                {product.description.split('\n')[0]}
              </p>
            )}

            {/* Price */}
            <div className="border border-gray-200 rounded-2xl bg-white p-6 space-y-4">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-1">Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-volkhov italic font-bold text-4xl text-black">
                      {'$'}{current.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">/ unit</span>
                  </div>
                </div>
                {savingsPct && (
                  <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-black text-white">
                    Save {savingsPct}%
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {product.moq > 1 && (
                  <p className="text-gray-500">
                    Min. Order: <span className="font-semibold text-black">{product.moq} units</span>
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stockStatusConfig[stock]?.color || '#000' }} />
                  <span className="font-medium" style={{ color: stockStatusConfig[stock]?.color || '#000' }}>
                    {stockStatusConfig[stock]?.label || 'In Stock'}
                  </span>
                </div>
              </div>

              {/* Contact actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={scrollToQuote}
                  className="flex-1 h-12 rounded-full bg-black text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-neutral-800 active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" /> Request a Quote
                </button>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 rounded-full border-2 border-black text-black font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-black hover:text-white active:scale-[0.98]"
                >
                  <WhatsAppIcon className="w-5 h-5" /> WhatsApp
                </a>
              </div>
            </div>

            {/* Bulk pricing tiers */}
            {pricingTiers.length > 0 && (
              <div className="border border-gray-200 rounded-2xl bg-white p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-2">Bulk Pricing Tiers</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500">
                      <th className="pb-2 font-medium">Order Qty</th>
                      <th className="pb-2 font-medium">Price / Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingTiers.map((tier, i) => {
                      const isBest = i === pricingTiers.length - 1;
                      return (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="py-2.5 text-black">
                            {tier.qty_from}â€“{tier.qty_to || 'âˆž'} units
                            {isBest && (
                              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#F4F4F6] text-gray-700">Best Value</span>
                            )}
                          </td>
                          <td className="py-2.5 font-volkhov italic font-semibold text-black">
                            {'$'}{Number(tier.price_per_unit || tier.price).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* WhatsApp contact */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full border border-gray-200 bg-white text-black text-base font-semibold hover:border-black transition-all duration-300 active:scale-[0.98]"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </a>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { icon: ShieldCheck, label: 'Verified Supplier' },
                { icon: Truck, label: 'Fast Delivery' },
                { icon: Lock, label: 'Secure Payment' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 border border-gray-200 rounded-2xl py-4 px-2 text-center bg-white hover:shadow-md transition-shadow">
                  <Icon className="w-5 h-5 text-black" />
                  <span className="text-[11px] leading-tight text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-[1400px] mx-auto px-4 mt-10">
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
          {['description', 'specifications', 'shipping', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 text-sm font-medium capitalize transition-all whitespace-nowrap border-b-2 -mb-[1px]"
              style={{
                color: activeTab === tab ? '#000000' : '#9CA3AF',
                borderColor: activeTab === tab ? '#000000' : 'transparent',
                fontFamily: activeTab === tab ? 'Volkhov, serif' : 'inherit',
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
              <div className="max-w-3xl leading-relaxed whitespace-pre-line text-gray-800">{product.description}</div>
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-2xl border border-gray-200 rounded-2xl" style={{ backgroundColor: cardBg }}>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, val], i) => (
                        <tr key={i} className="border-b last:border-0 border-gray-100" style={{ backgroundColor: i % 2 === 0 ? cardBg : panelBg }}>
                          <td className="px-5 py-3.5 font-medium capitalize text-black">{String(key).replace(/_/g, ' ')}</td>
                          <td className="px-5 py-3.5 text-gray-500">{String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="p-6 text-gray-500">No specifications available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-2xl space-y-4">
                <div className="border border-gray-200 rounded-2xl p-6" style={{ backgroundColor: cardBg }}>
                  <h4 className="font-volkhov font-semibold mb-3 text-black">Delivery & Shipping</h4>
                  <ul className="space-y-2.5 text-sm" style={{ color: tan }}>
                    <li className="flex items-start gap-2.5"><Truck className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" /> Delivery across all major cities in Pakistan</li>
                    <li className="flex items-start gap-2.5"><Truck className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" /> Estimated delivery: 3â€“7 business days</li>
                    <li className="flex items-start gap-2.5"><Truck className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" /> International shipping available on request</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-2xl p-6" style={{ backgroundColor: cardBg }}>
                  <h4 className="font-volkhov font-semibold mb-2 text-black">Payment Methods</h4>
                  <p className="text-sm text-gray-500">Secure international payments via Paddle â€” Visa, Mastercard, PayPal, Apple Pay, Google Pay and more.</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewSection productId={product.id} rating={rating} reviewsCount={reviews} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Buyer benefit cards */}
      <div className="max-w-[1400px] mx-auto px-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-3 gap-5">
          <BuyerBenefitCard
            icon={Award}
            eyebrow="Wholesale"
            title="Bulk pricing that scales"
            lines={[
              `MOQ: ${product.moq > 1 ? `${product.moq} units` : 'Any quantity'}`,
              `Unit price from ${'$'}${current.toFixed(2)}${savingsPct ? ` â€” list ${'$'}${listPrice.toFixed(2)}` : ''}`,
              pricingTiers.length > 0 ? `${pricingTiers.length} quantity tiers Â· best value at top tier` : 'Flat wholesale rate for all orders',
            ]}
          />
          <BuyerBenefitCard
            icon={Factory}
            eyebrow="Supplier"
            title={product.supplier_name || 'Core Collective'}
            lines={[
              product.is_verified ? 'Verified wholesale supplier' : 'Wholesale supplier',
              'Typically responds within 24 hours',
              'Direct wholesale pricing, no middlemen',
            ]}
          />
          <BuyerBenefitCard
            icon={Truck}
            eyebrow="Delivery"
            title="Fast, trackable delivery"
            lines={[
              'Nationwide in Pakistan Â· 3â€“7 business days',
              'International shipping on request',
              'Secure checkout via Paddle payments',
            ]}
          />
        </div>
      </div>

      {/* Quote + Related */}
      <div className="max-w-[1400px] mx-auto px-4 pb-28 sm:pb-16 grid grid-cols-1 desktop:grid-cols-12 gap-10 mt-10">
        {/* Quote form */}
        <div className="desktop:col-span-5">
          <motion.div
            id="request-quote"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-gray-200 rounded-2xl p-7 desktop:sticky desktop:top-28"
            style={{ backgroundColor: cardBg }}
          >
            {quoteSent ? (
              <div className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 mx-auto mb-4 border border-gray-200 rounded-full flex items-center justify-center" style={{ backgroundColor: panelBg }}>
                  <CheckCircle className="w-8 h-8 text-black" />
                </motion.div>
                <h3 className="font-volkhov text-lg font-bold mb-2 text-black">Quote Request Sent!</h3>
                <p className="text-sm mb-4 text-gray-500">The supplier will respond within 24 hours.</p>
                <button onClick={() => { setQuoteSent(false); setQuoteForm({ name: '', business: '', phone: '', email: '', quantity: '', message: '' }); }} className="text-sm text-black underline underline-offset-4 hover:opacity-70">
                  Send another request
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-volkhov text-lg font-bold mb-1 text-black">Request a Quote</h3>
                <p className="text-sm mb-6 text-gray-500">Get a custom quote for bulk orders</p>
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-500">Full Name *</label>
                      <input type="text" value={quoteForm.name} onChange={e => setQuoteForm(p => ({ ...p, name: e.target.value }))} required
                        className="w-full px-3.5 py-2.5 text-sm outline-none border border-gray-200 rounded-lg bg-white text-black transition-colors focus:border-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-500">Business Name</label>
                      <input type="text" value={quoteForm.business} onChange={e => setQuoteForm(p => ({ ...p, business: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm outline-none border border-gray-200 rounded-lg bg-white text-black transition-colors focus:border-black" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-500">Phone *</label>
                      <input type="tel" value={quoteForm.phone} onChange={e => setQuoteForm(p => ({ ...p, phone: e.target.value }))} required
                        className="w-full px-3.5 py-2.5 text-sm outline-none border border-gray-200 rounded-lg bg-white text-black transition-colors focus:border-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-500">Email *</label>
                      <input type="email" value={quoteForm.email} onChange={e => setQuoteForm(p => ({ ...p, email: e.target.value }))} required
                        className="w-full px-3.5 py-2.5 text-sm outline-none border border-gray-200 rounded-lg bg-white text-black transition-colors focus:border-black" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-500">Quantity (min. {product.moq || 1})</label>
                    <input type="number" min={product.moq || 1} value={quoteForm.quantity} onChange={e => setQuoteForm(p => ({ ...p, quantity: e.target.value }))} required
                      className="w-full px-3.5 py-2.5 text-sm outline-none border border-gray-200 rounded-lg bg-white text-black transition-colors focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-500">Message (optional)</label>
                    <textarea rows={3} value={quoteForm.message} onChange={e => setQuoteForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Any specific requirements..."
                      className="w-full px-3.5 py-2.5 text-sm outline-none border border-gray-200 rounded-lg bg-white text-black transition-colors focus:border-black resize-none" />
                  </div>
                  {quoteError && (
                    <div className="flex items-center gap-2 p-3 text-sm border border-red-200 rounded-lg text-red-600 bg-red-50">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {quoteError}
                    </div>
                  )}
                  <button type="submit" disabled={quoteSubmitting}
                    className="w-full py-3.5 rounded-full bg-black text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50">
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
          <div className="flex items-end justify-between mb-5">
            <h3 className="font-volkhov text-xl font-bold text-black">Similar Products</h3>
            <Link href={`/products?category=${encodeURIComponent(product.category || '')}`} className="text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-black transition-colors shrink-0">
              View All â†’
            </Link>
          </div>
          <RelatedProducts category={product.category} currentId={product.id} currentName={product.name} />
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Price</p>
          <p className="font-volkhov italic font-bold text-lg text-black leading-tight">{'$'}{current.toFixed(2)}</p>
        </div>
        <button
          onClick={scrollToQuote}
          className="flex-1 h-12 rounded-full bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Send className="w-4 h-4" /> Request a Quote
        </button>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="h-12 w-12 rounded-full border-2 border-black text-black flex items-center justify-center transition-all active:scale-[0.98]"
        >
          <WhatsAppIcon className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

function BuyerBenefitCard({ icon: Icon, eyebrow, title, lines }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
    >
      <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-1">{eyebrow}</p>
      <h4 className="font-volkhov font-bold text-lg text-black mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-500">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-black mt-2 shrink-0" />
            {line}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ReviewSection({ productId, rating, reviewsCount }) {
  const { userProfile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const loadReviews = () => {
    if (!supabase) { setLoading(false); return; }
    supabase.from('reviews').select('*').eq('product_id', productId).eq('is_approved', true)
      .then(({ data }) => { setReviews(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (form.name === '' && userProfile?.name) {
      setForm(f => ({ ...f, name: userProfile.name }));
    }
  }, [userProfile?.name]);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    loadReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const { error: err } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: userProfile?.id || null,
        rating: Number(form.rating) || 5,
        comment: form.comment.trim(),
        is_approved: false,
      });
      if (err) throw err;
      setSubmitted(true);
      loadReviews();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const star = (v) => (
    <Star key={v} className={`w-4 h-4 ${v <= Math.round(rating || 0) ? 'fill-black text-black' : 'text-gray-300'}`} />
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-volkhov text-4xl font-bold text-black">{rating || 'â€”'}</span>
          <div>
            <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map(star)}</div>
            <p className="text-xs mt-1 text-gray-500">{reviewsCount || 0} reviews</p>
          </div>
        </div>
      </div>

      {/* Write a review */}
      <div className="border border-gray-200 rounded-2xl p-6 mb-6 bg-white">
        <h4 className="font-volkhov font-semibold text-black mb-4">Write a Review</h4>
        {submitted ? (
          <div className="flex items-center gap-2 p-3 text-sm rounded-lg border border-green-200 bg-green-50 text-green-700">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Thanks for your review! It will appear once approved.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="block text-xs font-medium text-gray-500">Your Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))} aria-label={`${s} star`} className="transition-transform hover:scale-110">
                    <Star className={`w-5 h-5 ${s <= (form.rating || 5) ? 'fill-black text-black' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                className="w-full px-3.5 py-2.5 text-sm outline-none border border-gray-200 rounded-lg bg-white text-black transition-colors focus:border-black" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">Your Review</label>
              <textarea rows={3} value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} required
                placeholder="Share your experience with this product..."
                className="w-full px-3.5 py-2.5 text-sm outline-none border border-gray-200 rounded-lg bg-white text-black transition-colors focus:border-black resize-none" />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm border border-red-200 rounded-lg text-red-600 bg-red-50">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-full bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50">
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4 fill-white" />}
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <div className="h-24 border border-gray-200 rounded-2xl animate-pulse" style={{ ...borderGoldSoft, backgroundColor: panelBg }} />
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No approved reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => {
            const reviewerName = review.user_id && userProfile?.id && review.user_id === userProfile.id
              ? 'You'
              : (review.buyer_name || 'Anonymous');
            return (
              <div key={review.id || i} className="border border-gray-200 rounded-2xl p-5" style={{ backgroundColor: cardBg }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center text-xs font-bold border border-gray-200 rounded-full text-black" style={{ backgroundColor: panelBg }}>
                      {reviewerName[0]}
                    </div>
                    <span className="text-sm font-medium text-black">{reviewerName}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= (Number(review.rating) || 0) ? 'fill-black text-black' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-800">{review.comment}</p>
                <p className="text-xs mt-2 text-gray-400">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</p>
              </div>
            );
          })}
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
          <div key={i} className="rounded-2xl animate-pulse" style={{ backgroundColor: panelBg }}>
            <div className="aspect-[3/4] rounded-2xl" />
            <div className="h-12 p-4" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) return <p className="text-sm text-gray-500">No similar products found in this category.</p>;

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
        className="group relative flex flex-col h-full"
      >
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F4F4F6] p-2 flex items-center justify-center transition-all duration-300 group-hover:shadow-xl">
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
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
          )}

          <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black bg-white/90 backdrop-blur rounded-full">
            {category}
          </span>
        </div>

        <div className="mt-3 px-1 flex flex-col flex-1">
          <h3 className="font-volkhov font-bold text-[15px] leading-snug text-black line-clamp-1 transition-colors group-hover:text-gray-700">
            {p.name}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'fill-black text-black' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-gray-500">({reviews})</span>
          </div>

          <div className="mt-2.5 flex-1">
            <span className="font-volkhov italic font-bold text-lg text-black">
              {'$'}{current.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`mt-3 w-full py-2.5 text-[13px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 rounded-md transition-all duration-300 active:scale-[0.98] ${
              added ? 'bg-green-700 text-white' : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {added ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}

