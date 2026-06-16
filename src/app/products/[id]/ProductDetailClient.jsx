'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, ShieldCheck, Truck, Lock, Send, Loader, ChevronLeft, ChevronRight, Heart, Share2, Eye, ShoppingBag, CheckCircle, AlertCircle, X, ShoppingCart, ChevronUp, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';

const categoryColors = {
  Electronics: 'bg-blue-500/20 text-blue-400',
  Clothing: 'bg-pink-500/20 text-pink-400',
  Furniture: 'bg-amber-500/20 text-amber-400',
  'Pet Supplies': 'bg-green-500/20 text-green-400',
  Tools: 'bg-orange-500/20 text-orange-400',
  Sports: 'bg-emerald-500/20 text-emerald-400',
  'Modern Tech': 'bg-gold/20 text-gold',
};

const stockStatusConfig = {
  in_stock: { label: 'In Stock', color: 'text-green-400', dot: 'bg-green-400' },
  limited: { label: 'Limited Stock', color: 'text-orange-400', dot: 'bg-orange-400' },
  out_of_stock: { label: 'Out of Stock', color: 'text-red-400', dot: 'bg-red-400' },
};

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

  useEffect(() => {
    fetchProduct();
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

  const images = product?.images?.length > 0
    ? product.images
    : product?.image_url
      ? [product.image_url]
      : [];

  const pricingTiers = product?.pricing_tiers || [];

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
      const unitPrice = product.price_min || product.price || 0;
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 animate-pulse" />
          <div className="h-4 w-48 mx-auto bg-gradient-to-r from-[#1C1C2E] via-[#2A2A40] to-[#1C1C2E] bg-[length:200%_100%] animate-shimmer rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-black" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product not found</h2>
          <button onClick={() => router.push('/products')} className="text-primary hover:underline">Browse all products</button>
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
      price: product.price_min || product.price || 0,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock_status === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: product.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewsCount: product.reviews_count || 0,
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
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-black" aria-label="Breadcrumb">
          <button onClick={() => router.push('/')} className="hover:text-primary transition-colors">Home</button>
          <ChevronDown className="w-3 h-3 -rotate-90" />
          <button onClick={() => router.push('/products')} className="hover:text-primary transition-colors">Products</button>
          <ChevronDown className="w-3 h-3 -rotate-90" />
          <span className="text-primary truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left - Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-6">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer">
              {images[activeImage] ? (
                <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black"><ShoppingBag className="w-16 h-16" /></div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(i => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all opacity-70 lg:opacity-0 lg:group-hover:opacity-100">
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={() => setActiveImage(i => Math.min(images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all opacity-70 lg:opacity-0 lg:group-hover:opacity-100">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt={`${product.name} - Image ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right - Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-6 space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${categoryColors[product.category] || 'bg-gray-500/20 text-black'}`}>
                {product.category}
              </span>
              {product.is_verified && (
                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-semibold text-green-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Supplier
                </span>
              )}
              {product.is_featured && (
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-semibold text-amber-400">
                  Ã¢Â­Â Featured
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-black'}`} />
                ))}
                <span className="text-amber-400 font-medium text-sm ml-1">{product.rating}</span>
                <span className="text-black text-sm">({product.reviews_count || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-black text-sm">
                <Eye className="w-4 h-4" /> {product.views || 0} views
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5 space-y-4">
              <div>
                <p className="text-sm text-black mb-1">Price Range</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    PKR {(product.price_min || product.price || 0).toLocaleString()}
                  </span>
                  {(product.price_max || product.price) !== (product.price_min || product.price) && (
                    <span className="text-xl text-black">
                      Ã¢â‚¬â€œ PKR {(product.price_max || product.price).toLocaleString()}
                    </span>
                  )}
                  <span className="text-sm text-black">/ unit</span>
                </div>
              </div>

              {pricingTiers.length > 0 && (
                <div>
                  <p className="text-xs text-black uppercase tracking-wider mb-2 font-medium">Bulk Pricing Tiers</p>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2.5 text-left text-black font-medium">Order Qty</th>
                          <th className="px-4 py-2.5 text-left text-black font-medium">Price/Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A2A40]">
                        {pricingTiers.map((tier, i) => {
                          const isBest = i === pricingTiers.length - 1;
                          return (
                            <tr key={i} className={`${isBest ? 'bg-amber-500/5' : ''}`}>
                              <td className={`px-4 py-2.5 ${isBest ? 'text-amber-300 font-medium' : 'text-black'}`}>
                                {tier.qty_from}Ã¢â‚¬â€œ{tier.qty_to || 'Ã¢Ë†Å¾'} units
                                {isBest && <span className="ml-2 text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">Best</span>}
                              </td>
                              <td className={`px-4 py-2.5 font-medium ${isBest ? 'text-amber-300' : 'text-white'}`}>
                                PKR {Number(tier.price_per_unit || tier.price).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {product.moq > 1 && (
                <div className="px-4 py-2 bg-gray-100 rounded-xl text-sm text-black">
                  Min. Order: <span className="font-semibold text-gray-900">{product.moq} units</span>
                </div>
              )}
              <div className="px-4 py-2 bg-gray-100 rounded-xl text-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stockStatusConfig[product.stock_status]?.dot || 'bg-gray-500'}`} />
                <span className={stockStatusConfig[product.stock_status]?.color || 'text-black'}>
                  {stockStatusConfig[product.stock_status]?.label || product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setBuyModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary to-amber-600 hover:from-primary-600 hover:to-amber-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/20">
                <ShoppingCart className="w-5 h-5" /> Buy Now
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-black pt-2 border-t border-gray-200">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Verified Supplier</span>
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Fast Delivery</span>
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Secure</span>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 lg:mt-12">
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-thin no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
            {['description', 'specifications', 'shipping', 'reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium capitalize whitespace-nowrap transition-all border-b-2 -mb-[1px] ${
                  activeTab === tab ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-900'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-6">
              {activeTab === 'description' && (
                <div className="max-w-3xl">
                  <p className="text-black leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="max-w-xl">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-[#2A2A40]">
                          {Object.entries(product.specifications).map(([key, val], i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-black font-medium capitalize">{key.replace(/_/g, ' ')}</td>
                              <td className="px-4 py-3 text-gray-200">{val}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-black">No specifications available for this product.</p>
                  )}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="max-w-2xl space-y-4 text-black">
                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Delivery & Shipping</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2"><Truck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Delivery across all major cities in Pakistan</li>
                      <li className="flex items-start gap-2"><Truck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Estimated delivery: 3Ã¢â‚¬â€œ7 business days</li>
                      <li className="flex items-start gap-2"><Truck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> International shipping available on request</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-2">Payment Methods</h4>
                    <p className="text-sm">Bank Transfer, JazzCash, EasyPaisa, and Credit/Debit Cards</p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <ReviewSection productId={product.id} rating={product.rating} reviewsCount={product.reviews_count} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quote Form + Related */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Quote Form */}
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
              {quoteSent ? (
                <div className="text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Quote Request Sent!</h3>
                  <p className="text-sm text-black mb-4">The supplier will respond within 24 hours.</p>
                  <button onClick={() => { setQuoteSent(false); setQuoteForm({ name: '', business: '', phone: '', email: '', quantity: '', message: '' }); }}
                    className="text-sm text-primary hover:underline">Send another request</button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Request a Quote</h3>
                  <p className="text-sm text-black mb-5">Get a custom quote for bulk orders</p>
                  <form onSubmit={handleQuoteSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Full Name *</label>
                        <input type="text" value={quoteForm.name} onChange={e => setQuoteForm(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Business Name</label>
                        <input type="text" value={quoteForm.business} onChange={e => setQuoteForm(p => ({ ...p, business: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Phone *</label>
                        <input type="tel" value={quoteForm.phone} onChange={e => setQuoteForm(p => ({ ...p, phone: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-black mb-1">Email *</label>
                        <input type="email" value={quoteForm.email} onChange={e => setQuoteForm(p => ({ ...p, email: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-black mb-1">Quantity (min. {product.moq || 1})</label>
                      <input type="number" min={product.moq || 1} value={quoteForm.quantity} onChange={e => setQuoteForm(p => ({ ...p, quantity: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-black mb-1">Message (optional)</label>
                      <textarea rows={3} value={quoteForm.message} onChange={e => setQuoteForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Any specific requirements..."
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary resize-none" />
                    </div>
                    {quoteError && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {quoteError}
                      </div>
                    )}
                    <button type="submit" disabled={quoteSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-primary to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2">
                      {quoteSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {quoteSubmitting ? 'Sending...' : 'Request Quote'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>

          {/* Related Products */}
          <div className="lg:col-span-7">
            <RelatedProducts category={product.category} currentId={product.id} currentName={product.name} />
          </div>
        </div>
      </div>

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
    supabase.from('reviews').select('*').eq('product_id', productId).eq('is_approved', true)
      .then(({ data }) => { setReviews(data || []); setLoading(false); });
  }, [productId]);

  if (loading) return <div className="h-20 bg-gradient-to-r from-[#1C1C2E] via-[#2A2A40] to-[#1C1C2E] bg-[length:200%_100%] animate-shimmer rounded-xl" />;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{rating || 'Ã¢â‚¬â€'}</div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-black'}`} />
            ))}
          </div>
          <p className="text-xs text-black mt-1">{reviewsCount || 0} reviews</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-black text-sm">No reviews yet. Be the first to review this product.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div key={review.id || i} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                    {(review.buyer_name || 'U')[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{review.buyer_name || 'Anonymous'}</span>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-3 h-3 ${s <= (review.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-black'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-black">{review.comment}</p>
              <p className="text-xs text-black mt-2">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedProducts({ category, currentId, currentName }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    supabase.from('products').select('*')
      .eq('category', category).eq('is_active', true).eq('status', 'active')
      .not('id', 'eq', currentId)
      .not('name', 'eq', currentName)
      .limit(6)
      .then(({ data }) => setProducts(data || []));
  }, [category, currentId, currentName]);

  if (products.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, index }) {
  const router = useRouter();
  const p = product;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/products/${p.id}`)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer group hover:border-gold/50 hover:shadow-[0_0_20px_rgba(212,168,83,0.15)] hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
      </div>
      <div className="p-4 space-y-2">
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${categoryColors[p.category] || 'bg-gray-500/20 text-black'}`}>{p.category}</span>
        <h4 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{p.name}</h4>
        <div className="flex items-center gap-1 text-sm">
          <Star className={`w-3.5 h-3.5 ${p.rating >= 1 ? 'fill-amber-400 text-amber-400' : 'text-black'}`} />
          <span className="font-medium text-amber-400">{p.rating || 'â€”'}</span>
        </div>
        <p className="text-base font-bold text-gray-900">PKR {(p.price_min || p.price || 0).toLocaleString()}</p>
      </div>
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

  const paymentOptions = [
    { id: 'easypaisa', label: 'EasyPaisa', details: '+92 345 5900229', logo: 'https://static.cdnlogo.com/logos/e/80/easypaisa.svg' },
    { id: 'jazzcash', label: 'JazzCash', details: '+92 345 5900229', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/JazzCash_logo_%282025%29.png' },
    { id: 'hbl', label: 'HBL Bank', details: 'Account: 0012-3456789012\nIBAN: PK36 HABB 0012 3456 7890 1234', logo: 'https://static.cdnlogo.com/logos/h/55/hbl.svg' },
  ];

  if (paymentDone) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-500" />
          </motion.div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Request Submitted!</h3>
          <p className="text-sm text-black mb-2">Please wait for <span className="font-semibold text-gray-900">5 hours</span> to confirm or reject your order.</p>
          <p className="text-xs text-black mb-6">The admin will review your payment proof and update the status.</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onClose} className="px-6 py-2.5 bg-gradient-to-r from-primary to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Done
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  if (showPayment) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Make Payment</h3>
                <p className="text-xs text-black line-clamp-1">{product.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-black hover:text-black hover:bg-gray-100 rounded-lg transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="space-y-4">
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-amber-800 mb-2">Total Amount: PKR {((Number(form.quantity) || 1) * (product.price_min || product.price || 0)).toLocaleString()}</p>
              <p className="text-xs text-amber-700">Send payment to any of the options below and upload the screenshot.</p>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="space-y-3">
              <p className="text-xs font-semibold text-black uppercase tracking-wider">Payment Options</p>
              {paymentOptions.map((opt, i) => (
                <motion.div key={opt.id} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                  transition={{ delay: i * 0.1 }}>
                  <label onClick={() => setPaymentMethod(opt.id)}
                    className={`block p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${paymentMethod === opt.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                          <img src={opt.logo} alt={opt.label} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                          <p className="text-xs text-black whitespace-pre-line">{opt.details}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${paymentMethod === opt.id ? 'border-primary scale-110' : 'border-gray-300'}`}>
                        {paymentMethod === opt.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </label>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
              <p className="text-xs font-semibold text-black uppercase tracking-wider mb-2">Upload Payment Screenshot *</p>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                {paymentFile ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-2">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                    </motion.div>
                    <p className="text-sm font-medium text-gray-900">{paymentFile.name}</p>
                    <p className="text-xs text-black">{(paymentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setPaymentFile(null); }}
                      className="text-xs text-red-500 hover:underline">Remove</button>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="w-10 h-10 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </motion.div>
                    <p className="text-sm font-medium text-gray-900">Click to upload</p>
                    <p className="text-xs text-black">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setPaymentFile(f); }} />
              </motion.div>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPaymentConfirm} disabled={paymentSubmitting || !paymentFile}
              className="w-full py-3 bg-gradient-to-r from-primary to-amber-600 hover:from-primary-600 hover:to-amber-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
              {paymentSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {paymentSubmitting ? 'Submitting...' : 'Confirm Payment'}
            </motion.button>

            <motion.button variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              onClick={onClose} className="w-full py-2.5 text-sm text-black hover:text-black transition-colors">
              Cancel
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Buy Product</h3>
              <p className="text-xs text-black line-clamp-1">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-black hover:text-black hover:bg-gray-100 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          {canScrollUp && (
            <button type="button" onClick={() => scroll('up')}
              className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-black hover:text-primary hover:border-primary/30 transition-all">
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto scroll-smooth space-y-4 pr-1 -mr-1">
            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-black mb-1.5">Your Name</label>
                  <input type="text" value={user?.name || ''} disabled
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-black outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-1.5">Email</label>
                  <input type="email" value={user?.email || ''} disabled
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-black outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-1.5">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone')(e.target.value)} required
                    placeholder="+92 300 000 0000"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-1.5">Delivery Address *</label>
                  <textarea value={form.address} onChange={e => update('address')(e.target.value)} required rows={2}
                    placeholder="Street, city, province..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 transition-all resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-black mb-1.5">Quantity</label>
                    <input type="number" min="1" value={form.quantity} onChange={e => update('quantity')(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black mb-1.5">Unit Price</label>
                    <input type="text" value={`PKR ${(product.price_min || product.price || 0).toLocaleString()}`} disabled
                      className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-black outline-none cursor-not-allowed" />
                  </div>
                </div>
                {Number(form.quantity) > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl">
                    <span className="text-sm font-medium text-black">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">
                      PKR {((Number(form.quantity) || 1) * (product.price_min || product.price || 0)).toLocaleString()}
                    </span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-black mb-1.5">Message (optional)</label>
                  <textarea rows={3} value={form.message} onChange={e => update('message')(e.target.value)}
                    placeholder="Any specific requirements or notes..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 transition-all resize-none" />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                {!user && (
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> Please log in to submit a purchase request
                  </div>
                )}

                <button type="submit" disabled={!user}
                  className="w-full py-3 bg-gradient-to-r from-primary to-amber-600 hover:from-primary-600 hover:to-amber-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Submit Purchase Request
                </button>
              </div>
            </form>
          </div>
          {canScrollDown && (
            <button type="button" onClick={() => scroll('down')}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-black hover:text-primary hover:border-primary/30 transition-all">
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
