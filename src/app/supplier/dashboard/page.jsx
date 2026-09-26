'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import {
  Plus, Package, Clock, CheckCircle, XCircle, Loader2, Send,
  ArrowLeft, Search, Trash2, FileText, Image, ShoppingBag,
  LayoutDashboard, Store, ChevronDown, ExternalLink, AlertCircle, X
} from 'lucide-react';

const statusStyles = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const tabs = [
  { id: 'add', label: 'Add Product', icon: Plus },
  { id: 'products', label: 'My Products', icon: Package },
];

export default function SupplierDashboardPage() {
  const { userProfile, isSupplier, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('add');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!authLoading && (!userProfile || !isSupplier)) {
      router.push('/supplier/login');
    }
  }, [userProfile, isSupplier, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-black animate-spin" />
      </div>
    );
  }
  if (!userProfile || !isSupplier) return null;

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold ${
              toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 pt-24 sm:pt-28">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <Store className="w-6 h-6 text-black" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">Manage your products and submissions</p>
            </div>
          </div>
          <Link href="/notifications" className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-600 text-sm rounded-xl hover:border-black/30 transition-all">
            <Clock className="w-4 h-4" />
            Notifications
          </Link>
        </motion.div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-500 hover:text-black hover:border-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === 'add' && <AddProductTab showToast={showToast} userProfile={userProfile} />}
            {activeTab === 'products' && <MyProductsTab showToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AddProductTab({ showToast, userProfile }) {
  const categoryOptions = ['Electronics', 'Clothing', 'Furniture', 'Tools', 'Sports', 'Pet Supplies', 'Modern Tech'];

  const [form, setForm] = useState({
    name: '', description: '', category: '',
    image_url: '', image2: '', image3: '',
    price: '', price_min: '', price_max: '', stock: '', moq: '1', unit: 'Pcs',
    whatsapp: '', stock_status: 'in_stock',
  });
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [tiers, setTiers] = useState([{ min_qty: '', price: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [brokenImgs, setBrokenImgs] = useState({});

  const imageFields = [
    { key: 'image_url', label: 'Main Image', required: true },
    { key: 'image2', label: 'Image 2', required: false },
    { key: 'image3', label: 'Image 3', required: false },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { showToast('Product name is required', 'error'); return; }

    setSubmitting(true);
    try {
      const images = [form.image_url, form.image2, form.image3]
        .map(s => {
          const v = (s || '').trim();
          if (!v) return '';
          // Accept links pasted without a protocol (e.g. "ibb.co/xyz.jpg").
          return /^https?:\/\//i.test(v) ? v : `https://${v}`;
        })
        .filter(Boolean);
      const specifications = {};
      specs.forEach(s => { if (s.key.trim()) specifications[s.key.trim()] = s.value.trim(); });
      const pricing_tiers = tiers
        .filter(t => t.min_qty !== '' && t.price !== '')
        .map(t => ({ min_qty: parseInt(t.min_qty), price: parseFloat(t.price) }));

      const payload = {
        name: form.name,
        description: form.description || undefined,
        category: form.category || undefined,
        image_url: images[0] || undefined,
        images: images.length > 0 ? images : undefined,
        price: form.price ? parseFloat(form.price)
          : (form.price_min ? parseFloat(form.price_min) : undefined),
        price_min: form.price_min ? parseFloat(form.price_min) : undefined,
        price_max: form.price_max ? parseFloat(form.price_max) : undefined,
        stock: form.stock ? parseInt(form.stock) : 0,
        moq: parseInt(form.moq) || 1,
        unit: form.unit,
        whatsapp: form.whatsapp || undefined,
        stock_status: form.stock_status,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        pricing_tiers: pricing_tiers.length > 0 ? pricing_tiers : undefined,
      };
      // Submit DIRECTLY to Supabase with the supplier's own session — no
      // dependency on the backend deployment. Falls back to the backend API
      // if the direct insert is blocked (e.g. older RLS policies).
      let submitted = false;
      if (supabase) {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (user) {
          const { error } = await supabase.from('supplier_products').insert([{
            supplier_id: user.id,
            supplier_email: user.email,
            supplier_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Supplier',
            name: payload.name,
            description: payload.description || '',
            category: payload.category || '',
            image_url: payload.image_url || '',
            images: payload.images || [],
            price: payload.price ?? null,
            price_min: payload.price_min ?? null,
            price_max: payload.price_max ?? null,
            stock: payload.stock ?? 0,
            moq: payload.moq ?? 1,
            unit: payload.unit || 'Pcs',
            whatsapp: payload.whatsapp || '',
            stock_status: payload.stock_status || 'in_stock',
            specifications: payload.specifications || {},
            pricing_tiers: payload.pricing_tiers || [],
            status: 'pending',
          }]);
          if (!error) submitted = true;
          else console.error('Direct Supabase insert failed, using backend:', error.message);
        }
      }
      if (!submitted) {
        await api.supplierProducts.create(payload);   // backend fallback
      }
      showToast('Product submitted for admin review!');
      setForm({
        name: '', description: '', category: '',
        image_url: '', image2: '', image3: '',
        price: '', price_min: '', price_max: '', stock: '', moq: '1', unit: 'Pcs',
        whatsapp: '', stock_status: 'in_stock',
      });
      setSpecs([{ key: '', value: '' }]);
      setTiers([{ min_qty: '', price: '' }]);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key) => (value) => setForm(p => ({ ...p, [key]: value }));

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-amber-600/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">New Product</h3>
            <p className="text-xs text-gray-500">Submit a product for admin approval</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">Product Name *</label>
              <input type="text" value={form.name} onChange={e => update('name')(e.target.value)} required
                placeholder="Enter product name" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">Description</label>
              <textarea value={form.description} onChange={e => update('description')(e.target.value)} rows={3}
                placeholder="Describe your product..." className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">Category</label>
              <select value={form.category} onChange={e => update('category')(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 transition-colors">
                <option value="">Select category</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">Unit</label>
              <select value={form.unit} onChange={e => update('unit')(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 transition-colors">
                <option value="Pcs">Pcs</option>
                <option value="Kg">Kg</option>
                <option value="Ltr">Ltr</option>
                <option value="Meter">Meter</option>
                <option value="Box">Box</option>
                <option value="Set">Set</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">Price (fixed)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => update('price')(e.target.value)}
                placeholder="e.g. 1500" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Min Price</label>
                <input type="number" step="0.01" min="0" value={form.price_min} onChange={e => update('price_min')(e.target.value)}
                  placeholder="Min" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">Max Price</label>
                <input type="number" step="0.01" min="0" value={form.price_max} onChange={e => update('price_max')(e.target.value)}
                  placeholder="Max" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">Stock Quantity</label>
              <input type="number" min="0" value={form.stock} onChange={e => update('stock')(e.target.value)}
                placeholder="e.g. 100" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">MOQ</label>
              <input type="number" min="1" value={form.moq} onChange={e => update('moq')(e.target.value)}
                placeholder="e.g. 1" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">Stock Status</label>
              <select value={form.stock_status} onChange={e => update('stock_status')(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 transition-colors">
                <option value="in_stock">In Stock</option>
                <option value="limited">Limited</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">WhatsApp Number</label>
              <input type="text" value={form.whatsapp} onChange={e => update('whatsapp')(e.target.value)}
                placeholder="+92 300 000 0000" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
            </div>
          </div>

          {/* Images — main + 2 additional, saved to database and shown on product cards/detail */}
          <div className="border-t border-gray-200 pt-5">
            <label className="block text-xs text-gray-600 mb-2 font-medium">Product Images (up to 3)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {imageFields.map(({ key, label, required }) => (
                <div key={key}>
                  {/* Label sits ABOVE the input so it is always visible */}
                  <label className="block text-xs text-gray-700 mb-1.5 font-semibold">
                    {label}{required && <span className="text-red-400"> *</span>}
                  </label>
                  <div className="relative aspect-square rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                    {form[key] && !brokenImgs[key] ? (
                      <img src={form[key]} alt={`${label} preview`}
                        className="w-full h-full object-cover"
                        onError={() => setBrokenImgs(p => ({ ...p, [key]: true }))} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <Image className="w-8 h-8" strokeWidth={1.25} />
                        <span className="mt-1 text-[10px] font-medium text-gray-400 text-center px-2">
                          {form[key] && brokenImgs[key] ? 'Link broken — check the URL' : required ? 'Required' : 'Optional'}
                        </span>
                      </div>
                    )}
                  </div>
                  <input type="text" value={form[key]}
                    onChange={e => { setBrokenImgs(p => ({ ...p, [key]: false })); update(key)(e.target.value); }}
                    placeholder="https://image-link..." required={required}
                    className="mt-2 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5">
              <p className="text-[11px] leading-relaxed text-amber-900">
                Paste a <span className="font-semibold">public image link</span> that starts with
                <span className="font-semibold"> https://</span> and ends in
                <span className="font-semibold"> .jpg .jpeg .jfif .png .webp .gif .avif</span> or
                <span className="font-semibold"> .svg</span>.
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-800/80">
                Not allowed: <span className="font-semibold">.heic / .heif</span> (iPhone Photos),
                <span className="font-semibold"> .bmp</span>, <span className="font-semibold">.tif</span>, or any
                link that asks for a login. Spaces must be written as
                <span className="font-semibold"> %20</span>. Upload to the
                <span className="font-semibold"> Products</span> Supabase bucket for the fastest load.
              </p>
              <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                First image is the main thumbnail. All images appear on the product page and cards.
              </p>
            </div>
          </div>

          {/* Specifications */}
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs text-gray-600 font-medium">Specifications</label>
              <button type="button" onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                className="text-xs text-primary hover:text-amber-600 transition-colors font-medium">
                + Add row
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={s.key} onChange={e => {
                    const copy = [...specs]; copy[i] = { ...copy[i], key: e.target.value }; setSpecs(copy);
                  }} placeholder="e.g. Material" className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
                  <input type="text" value={s.value} onChange={e => {
                    const copy = [...specs]; copy[i] = { ...copy[i], value: e.target.value }; setSpecs(copy);
                  }} placeholder="e.g. Cotton" className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
                  {specs.length > 1 && (
                    <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs text-gray-600 font-medium">Pricing Tiers (volume discounts)</label>
              <button type="button" onClick={() => setTiers([...tiers, { min_qty: '', price: '' }])}
                className="text-xs text-primary hover:text-amber-600 transition-colors font-medium">
                + Add tier
              </button>
            </div>
            <div className="space-y-2">
              {tiers.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400">Min Qty</span>
                    <input type="number" min="1" value={t.min_qty} onChange={e => {
                      const copy = [...tiers]; copy[i] = { ...copy[i], min_qty: e.target.value }; setTiers(copy);
                    }} placeholder="e.g. 10" className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-400">Price per unit</span>
                    <input type="number" step="0.01" min="0" value={t.price} onChange={e => {
                      const copy = [...tiers]; copy[i] = { ...copy[i], price: e.target.value }; setTiers(copy);
                    }} placeholder="e.g. 1200" className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 transition-colors" />
                  </div>
                  {tiers.length > 1 && (
                    <button type="button" onClick={() => setTiers(tiers.filter((_, j) => j !== i))}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors mt-4">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-all disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
            <button type="button" onClick={() => {
              setForm({
                name: '', description: '', category: '',
                image_url: '', image2: '', image3: '',
                price: '', price_min: '', price_max: '', stock: '', moq: '1', unit: 'Pcs',
                whatsapp: '', stock_status: 'in_stock',
              });
              setSpecs([{ key: '', value: '' }]);
              setTiers([{ min_qty: '', price: '' }]);
            }}
              className="px-4 py-3 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-100 transition-all">
              Clear
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function MyProductsTab({ showToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await api.supplierProducts.getMine();
      setProducts(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">My Products</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {products.length} total &middot; {products.filter(p => p.status === 'pending').length} pending &middot; {products.filter(p => p.status === 'approved').length} approved
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100/50">
              {['Product', 'Category', 'Price', 'Status', 'Submitted', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-gray-500 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-600">
                <Package className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                <p>No products submitted yet</p>
                <p className="text-xs mt-1">Go to "Add Product" tab to submit your first product</p>
              </td></tr>
            ) : (
              products.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-[#1C1C2E] hover:bg-gray-100/50 transition-colors group">
                  <td className="px-5 py-4">
                    <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="text-gray-900 text-sm font-medium hover:text-black transition-colors">
                      {p.name}
                    </button>
                    {p.admin_notes && (
                      <p className="text-[10px] text-gray-600 mt-0.5">Notes: {p.admin_notes}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{p.category || 'Uncategorized'}</td>
                  <td className="px-5 py-4 text-gray-900 font-semibold text-xs">
                    {p.price ? `$${Number(p.price).toFixed(2)}` : p.price_min ? `$${Number(p.price_min).toFixed(2)} - $${Number(p.price_max).toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge2 status={p.status} />
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {p.status === 'pending' && (
                        <span className="text-[10px] text-yellow-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Awaiting review
                        </span>
                      )}
                      {p.status === 'approved' && (
                        <span className="text-[10px] text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Live
                        </span>
                      )}
                      {p.status === 'rejected' && (
                        <span className="text-[10px] text-red-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                      <button onClick={async () => {
                        if (!confirm('Delete this product submission?')) return;
                        try { await api.supplierProducts.delete(p.id); showToast('Deleted'); load(); }
                        catch (e) { showToast(e.message, 'error'); }
                      }} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {expandedId && (() => {
          const p = products.find(x => x.id === expandedId);
          if (!p) return null;
          return (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-[#FAF9F6] border-t border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailCard2 icon={ShoppingBag} label="Product" value={p.name} />
                <DetailCard2 icon={FileText} label="Description" value={p.description || 'N/A'} />
                <DetailCard2 icon={Package} label="Category" value={p.category || 'Uncategorized'} />
                <DetailCard2 icon={Image} label="Images" value={
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(p.images) ? p.images : [p.image_url].filter(Boolean)).slice(0, 3).map((img, i) => (
                      <img key={i} src={img} alt={`${p.name} ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                    ))}
                    {(!p.images || p.images.length === 0) && !p.image_url && 'No image'}
                  </div>
                } />
                <DetailCard2 icon={ShoppingBag} label="Price / Stock" value={`$${p.price ? Number(p.price).toFixed(2) : p.price_min ? `$${Number(p.price_min).toFixed(2)} - $${Number(p.price_max).toFixed(2)}` : 'N/A'} / Stock: ${p.stock ?? 0}`} />
                <DetailCard2 icon={ShoppingBag} label="WhatsApp" value={p.whatsapp || 'N/A'} />
                <DetailCard2 icon={Package} label="Stock Status" value={p.stock_status ? p.stock_status.replace('_', ' ') : 'in stock'} />
                <DetailCard2 icon={FileText} label="Unit" value={p.unit || 'Pcs'} />
                <DetailCard2 icon={FileText} label="MOQ" value={p.moq ?? 1} />
                <DetailCard2 icon={FileText} label="Admin Notes" value={p.admin_notes || 'No notes'} />
                {p.specifications && Object.keys(p.specifications).length > 0 && (
                  <div className="lg:col-span-3">
                    <h4 className="text-xs text-gray-500 font-medium mb-2">Specifications</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(p.specifications).map(([k, v]) => (
                        <div key={k} className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                          <span className="text-[10px] text-gray-500 uppercase">{k}</span>
                          <p className="text-sm text-gray-900 font-medium">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {p.pricing_tiers && p.pricing_tiers.length > 0 && (
                  <div className="lg:col-span-3">
                    <h4 className="text-xs text-gray-500 font-medium mb-2">Pricing Tiers</h4>
                    <div className="flex flex-wrap gap-2">
                      {p.pricing_tiers.map((t, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                          <span className="text-[10px] text-gray-500">Min {t.min_qty} units</span>
                          <p className="text-sm text-gray-900 font-medium">$${Number(t.price).toFixed(2)}/unit</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge2({ status }) {
  const style = statusStyles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A'}
    </span>
  );
}

function DetailCard2({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-sm text-gray-900 font-medium">{value || 'N/A'}</div>
    </div>
  );
}
