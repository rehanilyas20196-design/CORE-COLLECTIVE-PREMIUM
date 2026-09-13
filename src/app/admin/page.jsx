'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import AdminLoginCard from '../../components/admin/AdminLoginCard';
import {
  LayoutDashboard, Package, ClipboardList, MessageSquare,
  Bell, ArrowLeft, X, Check, Search, Trash2, Send,
  ChevronDown, Loader2, LogOut, ExternalLink, Clock,
  User, Users, Mail, Phone, MapPin, CreditCard, FileText, Eye,
  ShoppingBag, ThumbsUp, ThumbsDown, Image, ShoppingCart,
  Layers, ListChecks, Hash, Truck, CircleDot, PackageCheck,
  MapPin as MapPinIcon, Home, ArrowUp, Plus
} from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-gold to-amber-600' },
  { id: 'users', label: 'Users', icon: Users, color: 'from-slate-600 to-gray-700' },
  { id: 'orders', label: 'Orders', icon: Package, color: 'from-blue-500 to-cyan-600' },
  { id: 'inquiries', label: 'Inquiries', icon: ClipboardList, color: 'from-amber-500 to-orange-600' },
  { id: 'discounts', label: 'Discounts', icon: MessageSquare, color: 'from-emerald-500 to-teal-600' },
  { id: 'products', label: 'Pending Products', icon: ShoppingBag, color: 'from-purple-500 to-violet-600' },
  { id: 'buyrequests', label: 'Buy Requests', icon: ShoppingCart, color: 'from-cyan-500 to-teal-600' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-rose-500 to-pink-600' },
  { id: 'allproducts', label: 'All Products', icon: Layers, color: 'from-teal-500 to-emerald-600' },
  { id: 'contactmessages', label: 'Messages', icon: MessageSquare, color: 'from-indigo-500 to-purple-600' },
  { id: 'quotes', label: 'Quotes', icon: FileText, color: 'from-yellow-500 to-amber-600' },
];

const statusStyles = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  shipped: 'bg-gold/10 text-gold border-gold/20',
  in_transit: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  out_for_delivery: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminPage() {
  const { userProfile, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [buyRequests, setBuyRequests] = useState([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = useCallback(async () => {
    try { const d = await api.auth.getUsers(); setUsers(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (!authLoading && (!userProfile || !isAdmin)) {
      router.push('/login');
    }
  }, [userProfile, isAdmin, authLoading, router]);

  const loadOrders = useCallback(async () => {
    try { const d = await api.orders.getAll(); setOrders(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  }, []);

  const loadInquiries = useCallback(async () => {
    try { const d = await api.supplierInquiries.getAll(); setInquiries(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  }, []);

  const loadDiscounts = useCallback(async () => {
    try { const d = await api.discountMessages.getAll(); setDiscounts(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  }, []);

  const loadNotifications = useCallback(async () => {
    try { const d = await api.notifications.getAll(); setNotifications(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  }, []);

  const loadSupplierProducts = useCallback(async () => {
    try { const d = await api.supplierProducts.getAll(); setSupplierProducts(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  }, []);

  const loadBuyRequests = useCallback(async () => {
    try { const d = await api.buyRequests.getAll(); setBuyRequests(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  }, []);

  const loadMarketplaceProducts = useCallback(async () => {
    try { const d = await api.products.getAll(); setMarketplaceProducts(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  }, []);

  const loadContactMessages = useCallback(async () => {
    try { const d = await api.contactMessages.getAll(); setContactMessages(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  }, []);

  const loadQuotes = useCallback(async () => {
    try { const d = await api.quotes.getAll(); setQuotes(Array.isArray(d) ? d : []); }
    catch (e) { console.error(e); }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadOrders(), loadInquiries(), loadDiscounts(), loadNotifications(), loadSupplierProducts(), loadBuyRequests(), loadMarketplaceProducts(), loadContactMessages(), loadQuotes(), loadUsers()]);
    setLoading(false);
  }, [loadOrders, loadInquiries, loadDiscounts, loadNotifications, loadSupplierProducts, loadBuyRequests, loadMarketplaceProducts, loadContactMessages, loadQuotes, loadUsers]);

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) loadAll();
  }, [isAdmin, authLoading, loadAll]);

  if (authLoading) return <LoadingScreen />;
  if (!isAdmin) return <AdminLoginCard />;

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 text-gray-500 hover:text-white hover:bg-gray-100 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your marketplace operations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-300 text-sm rounded-xl hover:border-primary/30 transition-all">
              <Bell className="w-4 h-4" />
              Notifications
            </Link>
            <button onClick={async () => { const { supabase } = await import('../../lib/supabase'); await supabase.auth.signOut(); router.push('/'); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl hover:bg-red-500/20 transition-all">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Tabs - Mobile select + Desktop bar */}
        <div className="mb-6">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full sm:hidden px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:border-primary mb-3"
            aria-label="Select admin section"
          >
            {tabs.map(tab => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
          <div className="hidden sm:flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 lg:px-5 py-3 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingSkeleton key="loading" />
          ) : (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === 'dashboard' && <DashboardTab orders={orders} inquiries={inquiries} discounts={discounts} notifications={notifications} products={marketplaceProducts} users={users} />}
              {activeTab === 'users' && <UsersTab users={users} loadUsers={loadUsers} showToast={showToast} />}
              {activeTab === 'orders' && <OrdersTab orders={orders} loadOrders={loadOrders} showToast={showToast} />}
              {activeTab === 'inquiries' && <InquiriesTab inquiries={inquiries} loadInquiries={loadInquiries} showToast={showToast} />}
              {activeTab === 'discounts' && <DiscountsTab discounts={discounts} loadDiscounts={loadDiscounts} showToast={showToast} />}
              {activeTab === 'products' && <SupplierProductsTab products={supplierProducts} loadProducts={loadSupplierProducts} showToast={showToast} />}
              {activeTab === 'buyrequests' && <BuyRequestsTab requests={buyRequests} loadRequests={loadBuyRequests} showToast={showToast} />}
              {activeTab === 'notifications' && <NotificationsTab notifications={notifications} loadNotifications={loadNotifications} showToast={showToast} />}
              {activeTab === 'allproducts' && <AllProductsTab products={marketplaceProducts} loadProducts={loadMarketplaceProducts} showToast={showToast} />}
              {activeTab === 'contactmessages' && <ContactMessagesTab messages={contactMessages} loadMessages={loadContactMessages} showToast={showToast} />}
              {activeTab === 'quotes' && <QuotesTab quotes={quotes} loadQuotes={loadQuotes} showToast={showToast} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Dashboard ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function DashboardTab({ orders, inquiries, discounts, notifications, products, users }) {
  const categories = [...new Set((products || []).map(p => p.category).filter(Boolean))];
  const totalRevenue = orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
  const confirmedCount = orders.filter(o => o.status === 'confirmed' || o.status === 'delivered').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const productNames = [...(products || [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 12);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'from-gold/20 to-amber-600/10', textColor: 'text-gold', change: `${orders.filter(o => o.status === 'pending').length} pending` },
    { label: 'Confirmed', value: confirmedCount, icon: Check, color: 'from-emerald-500/20 to-emerald-600/10', textColor: 'text-emerald-400', change: `${deliveredCount} delivered` },
    { label: 'Total Users', value: users.length, icon: Users, color: 'from-slate-500/20 to-slate-600/10', textColor: 'text-slate-500', change: `${users.filter(u => u.is_supplier).length} suppliers` },
    { label: 'Total Products', value: products.length, icon: Layers, color: 'from-teal-500/20 to-teal-600/10', textColor: 'text-teal-500', change: `${categories.length} categories` },
    { label: 'Categories', value: categories.length, icon: ListChecks, color: 'from-indigo-500/20 to-indigo-600/10', textColor: 'text-indigo-500', change: 'in catalog' },
    { label: 'Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'from-blue-500/20 to-blue-600/10', textColor: 'text-blue-400', change: 'total' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative bg-white border border-gray-200 rounded-2xl p-5 overflow-hidden group hover:border-gray-500/50 transition-all duration-300 cursor-default"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{stat.change}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <WebsiteProgressPanel
          orders={orders}
          products={products}
          users={users}
          categories={categories}
          confirmed={confirmedCount}
          delivered={deliveredCount}
        />
        <CatalogPanel productNames={productNames} categories={categories} total={products.length} />
        <RecentActivityPanel orders={orders} inquiries={inquiries} />
      </div>
    </div>
  );
}

function WebsiteProgressPanel({ orders, products, users, categories, confirmed, delivered }) {
  const steps = [
    { label: 'Registered Users', value: users.length, done: users.length > 0 },
    { label: 'Products in Catalog', value: products.length, done: products.length > 0 },
    { label: 'Categories', value: categories.length, done: categories.length > 0 },
    { label: 'Orders Placed', value: orders.length, done: orders.length > 0 },
    { label: 'Orders Confirmed', value: confirmed, done: confirmed > 0 },
    { label: 'Orders Delivered', value: delivered, done: delivered > 0 },
  ];
  const avg = steps.every(s => s.done);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <Truck className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-gray-900">Website Progress</h3>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
            className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${s.done ? 'bg-emerald-500/15 text-emerald-500' : 'bg-gray-200 text-gray-400'}`}>
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm text-gray-700 flex-1">{s.label}</span>
            <span className="text-xs font-semibold text-gray-900">{s.value}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">Overall progress</span>
        <span className={`text-xs font-semibold ${avg ? 'text-emerald-500' : 'text-amber-500'}`}>
          {Math.round((steps.filter(s => s.done).length / steps.length) * 100)}%
        </span>
      </div>
      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((steps.filter(s => s.done).length / steps.length) * 100)}%` }} transition={{ delay: 0.5, duration: 0.8 }}
          className="h-full bg-gradient-to-r from-[#E8C04A] to-[#B8862E] rounded-full" />
      </div>
    </motion.div>
  );
}

function CatalogPanel({ productNames, categories, total }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Product Catalog</h3>
        </div>
        <span className="text-xs text-gray-500">{total} products</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(c => (
          <span key={c} className="px-2.5 py-1 bg-[#F6EDDE] text-[#8A5A2E] text-[11px] font-semibold rounded-full border border-[#D4A853]/30">
            {c}
          </span>
        ))}
      </div>
      {productNames.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No products yet</p>
      ) : (
        <ul className="divide-y divide-gray-100 max-h-[240px] overflow-y-auto pr-1">
          {productNames.map(p => (
            <li key={p.id} className="py-2 flex items-center justify-between gap-3">
              <span className="text-sm text-gray-800 truncate">{p.name}</span>
              <span className="text-[10px] text-gray-500 shrink-0">{p.category || 'Uncategorized'}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function RecentActivityPanel({ orders, inquiries }) {
  const combined = [
    ...orders.slice(0, 5).map(o => ({ ...o, _type: 'order', _label: `#ORD-${String(o.id).padStart(6, '0')}` })),
    ...inquiries.slice(0, 3).map(i => ({ ...i, _type: 'inquiry', _label: i.item_name })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 7);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <span className="text-xs text-gray-500">Latest 7 items</span>
      </div>
      <div className="divide-y divide-[#1C1C2E]">
        {combined.map((item, i) => (
          <motion.div
            key={`${item._type}-${item.id}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                item._type === 'order' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {item._type === 'order' ? <Package className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">{item._label}</p>
                <p className="text-xs text-gray-500">{item.full_name || item.user_name || item.user_email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={item.status} />
              <span className="text-[10px] text-gray-600">{timeAgo(item.created_at)}</span>
            </div>
          </motion.div>
        ))}
        {combined.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500 text-sm">No recent activity</div>
        )}
      </div>
    </motion.div>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Orders Tab ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
/* Users Tab --------------------------------------------------------------------- */
function UsersTab({ users, loadUsers, showToast }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = users.filter(u => {
    const matchesSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const role = u.is_admin ? 'admin' : u.is_supplier ? 'supplier' : 'user';
    const matchesFilter = filter === 'all' || role === filter;
    return matchesSearch && matchesFilter;
  });

  const initials = (name) => (name || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Registered Users</h3>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} total &middot; {users.filter(u => u.is_supplier).length} suppliers</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50">
            <option value="all">All users</option>
            <option value="user">Buyers</option>
            <option value="supplier">Suppliers</option>
            <option value="admin">Admin</option>
          </select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100/50">
              {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Last Sign In', 'Verified'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-gray-500 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-16 text-center text-gray-400">{search ? 'No matching users' : 'No users yet'}</td></tr>
            ) : (
              filtered.map((u, i) => {
                const role = u.is_admin ? 'admin' : u.is_supplier ? 'supplier' : 'user';
                return (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-200 hover:bg-gray-100/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8C04A] to-[#B8862E] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {initials(u.full_name || u.name || u.email)}
                        </div>
                        <p className="text-gray-900 text-sm font-medium">{u.full_name || u.name || 'User'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs">{u.email || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{u.phone || '-'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        role === 'admin' ? 'bg-gold/10 text-gold border-gold/30'
                        : role === 'supplier' ? 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                        : 'bg-blue-500/10 text-blue-500 border-blue-500/25'
                      }`}>
                        {role}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={u.status || 'active'} /></td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${u.confirmed ? 'text-emerald-500' : 'text-red-400'}`}>
                        <CircleDot className="w-3.5 h-3.5" />
                        {u.confirmed ? 'Confirmed' : 'Unconfirmed'}
                      </span>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Orders Tab ------------------------------------------------------------------ */
function OrdersTab({ orders, loadOrders, showToast }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [messageOrder, setMessageOrder] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const filtered = orders.filter(o =>
    !search || o.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    String(o.id).includes(search) || o.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const sendCustomerMessage = async (orderId) => {
    if (!messageText.trim()) return;
    setSendingMessage(true);
    try {
      await api.orders.sendMessage(orderId, messageText.trim());
      showToast('Message sent to customer');
      setMessageOrder(null);
      setMessageText('');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAction = async (id, action, extra) => {
    setActionLoading(true);
    try {
      if (action === 'confirm') {
        await api.orders.updateStatus(id, 'confirmed');
        showToast(`Order #ORD-${String(id).padStart(6, '0')} confirmed`);
      } else if (action === 'reject') {
        await api.orders.updateStatus(id, 'rejected');
        showToast(`Order #ORD-${String(id).padStart(6, '0')} rejected`);
      } else if (action === 'tracking') {
        await api.orders.updateTracking(id, extra.status, extra.note);
        showToast('Tracking updated');
      } else if (action === 'delete') {
        await api.orders.delete(id);
        showToast('Order deleted');
      }
      setShowModal(null);
      await loadOrders();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
            <p className="text-xs text-gray-400 mt-0.5">{orders.length} total</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/50">
                {['ID', 'Customer', 'Amount', 'Payment', 'Status', 'Tracking', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-3 sm:px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-gray-600">{search ? 'No matching orders' : 'No orders yet'}</td></tr>
              ) : (
                filtered.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-200 hover:bg-gray-100/50 transition-colors group"
                  >
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="text-primary font-mono text-xs font-semibold hover:underline">
                        #{String(order.id).padStart(6, '0')}
                      </button>
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <p className="text-gray-900 text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{order.full_name || 'N/A'}</p>
                      <p className="text-gray-600 text-[10px] truncate max-w-[120px] sm:max-w-none">{order.user_email || ''}</p>
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-900 font-semibold text-xs sm:text-sm whitespace-nowrap">Rs. {Number(order.total_amount || 0).toLocaleString()}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{order.payment_method || 'N/A'}</span>
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4"><StatusBadge status={order.tracking_status || order.status} /></td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {order.status === 'pending' && (
                          <>
                            <ActionBtn label="Approve" color="green" onClick={() => { setModalType('confirm'); setShowModal(order); }} />
                            <ActionBtn label="Reject" color="red" onClick={() => { setModalType('reject'); setShowModal(order); }} />
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <ActionBtn label="Track" color="blue" onClick={() => { setModalType('tracking'); setShowModal(order); }} />
                        )}
                        <ActionBtn label="Message" color="blue" onClick={() => { setMessageText(''); setMessageOrder(order); }} />
                        <ActionBtn label="" color="red" icon={Trash2} onClick={() => { setModalType('delete'); setShowModal(order); }} />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Expansion */}
      <AnimatePresence>
        {expandedOrder && (() => {
          const order = orders.find(o => o.id === expandedOrder);
          if (!order) return null;
          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden mt-2"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailCard icon={User} label="Customer" value={order.full_name} sub={order.user_email} />
                <DetailCard icon={Phone} label="Phone" value={order.phone_number} />
                <DetailCard icon={MapPin} label="Address" value={`${order.address || ''}, ${order.city || ''}, ${order.province || ''}`} />
                <DetailCard icon={CreditCard} label="Payment" value={order.payment_method} sub={order.payment_screenshot ? 'Screenshot uploaded' : ''} />
                <DetailCard icon={Package} label="Items" value={`${order.items?.length || 0} items`} sub={`Total: Rs. ${Number(order.total_amount).toLocaleString()}`} />
                <DetailCard icon={FileText} label="Notes" value={order.admin_notes || 'No notes'} />
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Action Modals */}
      <AnimatePresence>
        {showModal && modalType && (
          <ActionModal
            type={modalType}
            item={showModal}
            onClose={() => { setShowModal(null); setModalType(null); }}
            onConfirm={modalType === 'delete'
              ? () => handleAction(showModal.id, 'delete')
              : modalType === 'confirm'
              ? () => handleAction(showModal.id, 'confirm')
              : modalType === 'reject'
              ? () => handleAction(showModal.id, 'reject')
              : null
            }
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* Message Customer Modal */}
      <AnimatePresence>
        {messageOrder && (
          <ModalOverlay onClose={() => setMessageOrder(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Message Customer</h3>
                <button onClick={() => setMessageOrder(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-900 font-medium">{messageOrder.full_name || 'Customer'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Order #ORD-{String(messageOrder.id).padStart(6, '0')} &middot; {messageOrder.user_email || 'no email'}</p>
              </div>
              <textarea value={messageText} onChange={e => setMessageText(e.target.value)}
                placeholder="Type your message to the customer..." rows={4}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 resize-none mb-4" />
              <div className="flex items-center gap-3 justify-end">
                <button onClick={() => setMessageOrder(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-100 transition-all">Cancel</button>
                <button onClick={() => sendCustomerMessage(messageOrder.id)} disabled={sendingMessage || !messageText.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-[#D9A63C] to-[#8A6A1E] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                  {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Inquiries Tab ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function InquiriesTab({ inquiries, loadInquiries, showToast }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = inquiries.filter(i =>
    !search || i.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.user_name?.toLowerCase().includes(search.toLowerCase()) || i.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (id, status, notes, ref) => {
    setActionLoading(true);
    try {
      await api.supplierInquiries.updateStatus(id, status, notes || undefined, ref || undefined);
      showToast(status === 'approved' ? 'Inquiry approved' : 'Inquiry rejected');
      setShowModal(null);
      await loadInquiries();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Supplier Inquiries</h3>
            <p className="text-xs text-gray-400 mt-0.5">{inquiries.length} total</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search inquiries..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600" />
          </div>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/50">
                {['User', 'Item', 'Details', 'Qty', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-3 sm:px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-600">{search ? 'No matches' : 'No inquiries yet'}</td></tr>
              ) : (
                filtered.map((inq, i) => (
                  <motion.tr key={inq.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-200 hover:bg-gray-100/50 transition-colors group">
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <p className="text-gray-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{inq.user_name || 'N/A'}</p>
                      <p className="text-gray-600 text-[10px] truncate max-w-[100px] sm:max-w-none">{inq.user_email || ''}</p>
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm">{inq.item_name}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs max-w-[120px] sm:max-w-[200px] truncate">{inq.details}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-600 text-xs whitespace-nowrap">{inq.quantity} {inq.unit || 'Pcs'}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4"><StatusBadge status={inq.status} /></td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs whitespace-nowrap">{new Date(inq.created_at).toLocaleDateString()}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {inq.status === 'pending' && (
                          <>
                            <ActionBtn label="Approve" color="green" onClick={() => { setModalAction('approve'); setShowModal(inq); }} />
                            <ActionBtn label="Reject" color="red" onClick={() => { setModalAction('reject'); setShowModal(inq); }} />
                          </>
                        )}
                        <button onClick={async () => {
                          if (!confirm('Delete this inquiry?')) return;
                          try { await api.supplierInquiries.delete(inq.id); showToast('Deleted'); await loadInquiries(); }
                          catch (e) { showToast(e.message, 'error'); }
                        }} className="p-1.5 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10" title="Delete">
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
      </div>

      <AnimatePresence>
        {showModal && modalAction && (
          <InquiryModal
            action={modalAction}
            inquiry={showModal}
            onClose={() => { setShowModal(null); setModalAction(null); }}
            onConfirm={handleAction}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Discounts Tab ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function DiscountsTab({ discounts, loadDiscounts, showToast }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = discounts.filter(d =>
    !search || d.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.user_email?.toLowerCase().includes(search.toLowerCase()) || d.message?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (id, status, reply) => {
    setActionLoading(true);
    try {
      await api.discountMessages.updateStatus(id, status, reply || undefined);
      showToast(status === 'approved' ? 'Discount approved' : 'Discount rejected');
      setShowModal(null);
      await loadDiscounts();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Discount Requests</h3>
            <p className="text-xs text-gray-400 mt-0.5">{discounts.length} total</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600" />
          </div>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/50">
                {['User', 'Email', 'Message', 'Status', 'Reply', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-3 sm:px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-600">{search ? 'No matches' : 'No discount requests'}</td></tr>
              ) : (
                filtered.map((d, i) => (
                  <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-200 hover:bg-gray-100/50 transition-colors group">
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{d.user_name || 'N/A'}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs truncate max-w-[100px] sm:max-w-none">{d.user_email || 'N/A'}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs max-w-[120px] sm:max-w-[220px] truncate">{d.message}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4"><StatusBadge status={d.status} /></td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs max-w-[80px] sm:max-w-[120px] truncate">{d.admin_reply || '-'}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs whitespace-nowrap">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {d.status === 'pending' && (
                          <>
                            <ActionBtn label="Approve" color="green" onClick={() => { setModalAction('approve'); setShowModal(d); }} />
                            <ActionBtn label="Reject" color="red" onClick={() => { setModalAction('reject'); setShowModal(d); }} />
                          </>
                        )}
                        <button onClick={async () => {
                          if (!confirm('Delete?')) return;
                          try { await api.discountMessages.delete(d.id); showToast('Deleted'); await loadDiscounts(); }
                          catch (e) { showToast(e.message, 'error'); }
                        }} className="p-1.5 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10" title="Delete">
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
      </div>

      <AnimatePresence>
        {showModal && modalAction && (
          <DiscountModal
            action={modalAction}
            item={showModal}
            onClose={() => { setShowModal(null); setModalAction(null); }}
            onConfirm={handleAction}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Notifications Tab ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
function NotificationsTab({ notifications, loadNotifications, showToast }) {
  const [newNotif, setNewNotif] = useState({ type: 'info', title: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newNotif.title || !newNotif.message) return;
    setSending(true);
    try {
      await api.notifications.create(newNotif.type, newNotif.title, newNotif.message, {});
      setNewNotif({ type: 'info', title: '', message: '' });
      showToast('Notification sent');
      await loadNotifications();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-28">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Send Notification</h3>
          <p className="text-xs text-gray-500 mb-6">Broadcast a message to all users</p>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Type</label>
              <select value={newNotif.type} onChange={e => setNewNotif(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 transition-colors">
                {['info', 'success', 'error', 'pending'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Title</label>
              <input type="text" value={newNotif.title} onChange={e => setNewNotif(p => ({ ...p, title: e.target.value }))}
                placeholder="Notification title" required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Message</label>
              <textarea value={newNotif.message} onChange={e => setNewNotif(p => ({ ...p, message: e.target.value }))}
                placeholder="Notification message" required rows={4}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600 transition-colors resize-none" />
            </div>
            <button type="submit" disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-primary-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">History</h3>
              <p className="text-xs text-gray-400 mt-0.5">{notifications.length} notifications</p>
            </div>
            <button onClick={async () => {
              try { await api.notifications.markAllAsRead(); showToast('All marked as read'); await loadNotifications(); }
              catch (e) { showToast(e.message, 'error'); }
            }} className="px-4 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-xl hover:bg-primary/20 transition-colors">
              Mark All Read
            </button>
          </div>
          <div className="divide-y divide-[#1C1C2E] max-h-[600px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-6 py-16 text-center text-gray-600">No notifications sent yet</div>
            ) : (
              notifications.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="px-5 py-4 flex items-start gap-3 hover:bg-gray-100/50 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${statusStyles[n.type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'} border`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-900 font-medium">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          n.is_read ? 'bg-gray-500/10 text-gray-500' : 'bg-primary/10 text-primary'
                        }`}>{n.is_read ? 'Read' : 'New'}</span>
                        <span className="text-[10px] text-gray-600">{timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={async () => {
                    try { await api.notifications.delete(n.id); await loadNotifications(); }
                    catch (e) { showToast(e.message, 'error'); }
                  }} className="p-1.5 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Ã¢â€Â¬Ã¢â€Â¬Ã¢â€Â¬ All Marketplace Products Tab Ã¢â€Â¬Ã¢â€Â¬Ã¢â€Â¬ */
function AllProductsTab({ products, loadProducts, showToast }) {
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addingLoading, setAddingLoading] = useState(false);

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = async (data) => {
    setAddingLoading(true);
    try {
      await api.products.create(data);
      showToast('Product added to marketplace');
      setAdding(false);
      await loadProducts();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setAddingLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this product from the marketplace?')) return;
    setDeleting(id);
    try {
      await api.products.delete(id);
      showToast('Product deleted from marketplace');
      await loadProducts();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">All Marketplace Products</h3>
          <p className="text-xs text-gray-400 mt-0.5">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D9A63C] to-[#8A6A1E] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100/50">
              {['Product', 'Supplier', 'Category', 'Price', 'Stock', 'Status', 'Created', 'Actions'].map(h => (
                <th key={h} className="text-left px-3 sm:px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-16 text-center text-gray-600">{search ? 'No matching products' : 'No products in the marketplace yet'}</td></tr>
            ) : (
              filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-gray-200 hover:bg-gray-100/50 transition-colors group">
                  <td className="px-3 sm:px-5 py-3 sm:py-4">
                    <p className="text-gray-900 text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{p.name}</p>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs">{p.supplier_name || 'N/A'}</td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs">{p.category || 'Uncategorized'}</td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-900 font-semibold text-xs whitespace-nowrap">
                    {p.price ? `Rs. ${Number(p.price).toLocaleString()}` : p.price_min ? `Rs. ${Number(p.price_min).toLocaleString()} - ${Number(p.price_max).toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs">{p.stock ?? 'N/A'}</td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4"><StatusBadge status={p.status || 'active'} /></td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4">
                    <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                      className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-red-500/10 text-red-500 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 whitespace-nowrap">
                      {deleting === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{deleting === p.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
</tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {adding && (
          <AddProductModal
            onClose={() => setAdding(false)}
            onConfirm={handleAddProduct}
            loading={addingLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddProductModal({ onClose, onConfirm, loading }) {
  const [form, setForm] = useState({
    name: '', category: '', price: '', price_min: '', price_max: '',
    stock: '', moq: '1', unit: 'Pcs', description: '', image_url: '',
    whatsapp: '', supplier_name: 'Admin',
  });

  const fields = [
    { key: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g. Premium T-Shirt', span: true },
    { key: 'category', label: 'Category', type: 'text', required: true, placeholder: 'e.g. Clothing', span: true },
    { key: 'price', label: 'Price (Rs.)', type: 'number', placeholder: '0' },
    { key: 'price_min', label: 'Price Min (Rs.)', type: 'number', placeholder: 'optional' },
    { key: 'price_max', label: 'Price Max (Rs.)', type: 'number', placeholder: 'optional' },
    { key: 'stock', label: 'Stock', type: 'number', placeholder: '0' },
    { key: 'moq', label: 'MOQ', type: 'number', placeholder: '1' },
    { key: 'unit', label: 'Unit', type: 'text', placeholder: 'Pcs' },
    { key: 'image_url', label: 'Image URL', type: 'text', placeholder: 'https://...', span: true },
    { key: 'whatsapp', label: 'WhatsApp', type: 'text', placeholder: '+92...' },
    { key: 'supplier_name', label: 'Supplier Name', type: 'text', placeholder: 'Admin' },
  ];

  const handleSubmit = () => {
    if (!form.name.trim() || !form.category.trim()) return;
    onConfirm({
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      price: form.price ? Number(form.price) : null,
      price_min: form.price_min ? Number(form.price_min) : null,
      price_max: form.price_max ? Number(form.price_max) : null,
      stock: form.stock ? Number(form.stock) : 0,
      moq: form.moq ? Number(form.moq) : 1,
      unit: form.unit || 'Pcs',
      whatsapp: form.whatsapp.trim(),
      supplier_name: form.supplier_name.trim() || 'Admin',
    });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {fields.map(f => (
            <div key={f.key} className={f.span ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}{f.required && <span className="text-red-400"> *</span>}</label>
              <input
                type={f.type}
                required={f.required}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Product description..." rows={3}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 resize-none" />
          </div>
        </div>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-100 transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading || !form.name.trim() || !form.category.trim()}
            className="px-5 py-2 bg-gradient-to-r from-[#D9A63C] to-[#8A6A1E] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </motion.div>
    </ModalOverlay>
  );
}

/* Supplier Products Tab ------------------------------------------------------ */
function SupplierProductsTab({ products, loadProducts, showToast }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier_email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (id, status, notes) => {
    setActionLoading(true);
    try {
      await api.supplierProducts.updateStatus(id, status, notes || undefined);
      showToast(status === 'approved' ? 'Product approved and added to marketplace' : 'Product rejected');
      setShowModal(null);
      await loadProducts();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Supplier Products</h3>
            <p className="text-xs text-gray-400 mt-0.5">{products.length} total &middot; {products.filter(p => p.status === 'pending').length} pending</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600" />
          </div>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/50">
                {['Product', 'Supplier', 'Category', 'Price', 'Stock', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-3 sm:px-5 py-3 text-gray-500 font-medium text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-gray-600">{search ? 'No matching products' : 'No supplier products yet'}</td></tr>
              ) : (
                filtered.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-200 hover:bg-gray-100/50 transition-colors group">
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <button onClick={() => setExpandedProduct(expandedProduct === p.id ? null : p.id)} className="text-gray-900 text-xs sm:text-sm font-medium hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-none block">
                        {p.name}
                      </button>
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <p className="text-gray-900 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{p.supplier_name || 'N/A'}</p>
                      <p className="text-gray-600 text-[10px] truncate max-w-[100px] sm:max-w-none">{p.supplier_email || ''}</p>
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs">{p.category || 'Uncategorized'}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-900 font-semibold text-xs whitespace-nowrap">
                      {p.price ? `Rs. ${Number(p.price).toLocaleString()}` : p.price_min ? `Rs. ${Number(p.price_min).toLocaleString()} - ${Number(p.price_max).toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs">{p.stock ?? 'N/A'}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-gray-500 text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {p.status === 'pending' && (
                          <>
                            <ActionBtn label="Approve" color="green" onClick={() => { setModalAction('approve'); setShowModal(p); }} />
                            <ActionBtn label="Reject" color="red" onClick={() => { setModalAction('reject'); setShowModal(p); }} />
                          </>
                        )}
                        <button onClick={async () => {
                          if (!confirm('Delete this product submission?')) return;
                          try { await api.supplierProducts.delete(p.id); showToast('Deleted'); await loadProducts(); }
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
      </div>

      {/* Product Detail Expansion */}
      <AnimatePresence>
        {expandedProduct && (() => {
          const p = products.find(x => x.id === expandedProduct);
          if (!p) return null;
          return (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden mt-2">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailCard icon={ShoppingBag} label="Product Name" value={p.name} />
                <DetailCard icon={User} label="Supplier" value={p.supplier_name} sub={p.supplier_email} />
                <DetailCard icon={Image} label="Images" value={
                  <div className="flex flex-wrap gap-2">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />}
                    {p.images?.filter(Boolean).map((img, i) => (
                      <img key={i} src={img} alt={`${p.name} ${i}`} className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        onError={e => { e.target.style.display = 'none' }} />
                    ))}
                    {!p.image_url && (!p.images || p.images.length === 0) && 'No images'}
                  </div>
                } />
                <DetailCard icon={Package} label="Category" value={p.category || 'Uncategorized'} />
                <DetailCard icon={FileText} label="Description" value={p.description || 'No description'} />
                <DetailCard icon={CreditCard} label="Price" value={p.price ? `Rs. ${Number(p.price).toLocaleString()}` : p.price_min ? `Rs. ${Number(p.price_min).toLocaleString()} - ${Number(p.price_max).toLocaleString()}` : 'N/A'} />
                <DetailCard icon={Package} label="Stock / MOQ" value={`${p.stock ?? 0} units / MOQ: ${p.moq ?? 1}`} sub={`Unit: ${p.unit || 'Pcs'} | Status: ${p.stock_status || 'in_stock'}`} />
                <DetailCard icon={Phone} label="WhatsApp" value={p.whatsapp || 'Not provided'} />
                <DetailCard icon={ListChecks} label="Specifications" value={
                  p.specifications && Object.keys(p.specifications).length > 0
                    ? <div className="text-xs space-y-0.5">{Object.entries(p.specifications).map(([k, v]) => (
                        <div key={k} className="flex gap-2"><span className="text-gray-500 font-medium">{k}:</span><span>{v}</span></div>
                      ))}</div>
                    : 'None'
                } />
                <DetailCard icon={Layers} label="Pricing Tiers" value={
                  p.pricing_tiers && p.pricing_tiers.length > 0
                    ? <div className="text-xs space-y-0.5">{p.pricing_tiers.map((t, i) => (
                        <div key={i} className="flex gap-2"><span className="text-gray-500">{t.min_qty}+:</span><span>Rs. {Number(t.price).toLocaleString()}/unit</span></div>
                      ))}</div>
                    : 'None'
                } />
                <DetailCard icon={FileText} label="Admin Notes" value={p.admin_notes || 'No notes'} />
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && modalAction && (
          <SupplierProductModal
            action={modalAction}
            item={showModal}
            onClose={() => { setShowModal(null); setModalAction(null); }}
            onConfirm={handleAction}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Buy Requests Tab Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const trackingFlow = ['confirmed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
const trackingLabels = {
  confirmed: 'Confirmed', shipped: 'Shipped', in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered'
};
const trackingNextStage = {
  confirmed: 'shipped', shipped: 'in_transit', in_transit: 'out_for_delivery',
  out_for_delivery: 'delivered'
};
const trackingNextLabels = {
  confirmed: 'Mark Shipped', shipped: 'Mark In Transit', in_transit: 'Mark Out for Delivery',
  out_for_delivery: 'Mark Delivered'
};

function BuyRequestsTab({ requests, loadRequests, showToast }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(null);
  const [modalAction, setModalAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [trackingModal, setTrackingModal] = useState(null);

  const filtered = requests.filter(r =>
    !search || r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (id, status, notes) => {
    setActionLoading(true);
    try {
      await api.buyRequests.updateStatus(id, status, notes || undefined);
      showToast(status === 'approved' ? 'Purchase request approved' : 'Purchase request rejected');
      setShowModal(null);
      await loadRequests();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTracking = async (id, trackingStatus, note) => {
    setActionLoading(true);
    try {
      await api.buyRequests.updateTracking(id, trackingStatus, note || undefined);
      showToast(`Tracking updated to ${trackingLabels[trackingStatus] || trackingStatus}`);
      setTrackingModal(null);
      await loadRequests();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Buy Requests</h3>
            <p className="text-xs text-gray-400 mt-0.5">{requests.length} total &middot; {requests.filter(r => r.status === 'pending').length} pending</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search requests..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Product', 'Buyer', 'Qty', 'Phone', 'Status', 'Tracking', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-gray-500 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-gray-400">{search ? 'No matching requests' : 'No buy requests yet'}</td></tr>
              ) : (
                filtered.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="text-gray-900 text-sm font-medium hover:text-primary transition-colors">
                        {r.product_name}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-900 text-sm">{r.user_name || 'N/A'}</p>
                      <p className="text-gray-400 text-[10px]">{r.user_email || ''}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700">{r.quantity || 1}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{r.phone || 'N/A'}</td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-4"><StatusBadge status={r.tracking_status || r.status} /></td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity flex-wrap">
                        {r.status === 'pending' && (
                          <>
                            <ActionBtn label="Approve" color="green" onClick={() => { setModalAction('approve'); setShowModal(r); }} />
                            <ActionBtn label="Reject" color="red" onClick={() => { setModalAction('reject'); setShowModal(r); }} />
                          </>
                        )}
                        {r.status === 'approved' && trackingNextStage[r.tracking_status] && (
                          <ActionBtn
                            label={trackingNextLabels[r.tracking_status]}
                            color="blue"
                            onClick={() => setTrackingModal({ request: r, nextStage: trackingNextStage[r.tracking_status] })}
                          />
                        )}
                        <button onClick={async () => {
                          if (!confirm('Delete this request?')) return;
                          try { await api.buyRequests.delete(r.id); showToast('Deleted'); await loadRequests(); }
                          catch (e) { showToast(e.message, 'error'); }
                        }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="Delete">
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
      </div>

      <AnimatePresence>
        {expandedId && (() => {
          const r = requests.find(x => x.id === expandedId);
          if (!r) return null;
          const trackingHistory = Array.isArray(r.tracking_history) ? r.tracking_history : [];
          return (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden mt-2">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailCard icon={ShoppingCart} label="Product" value={r.product_name} />
                <DetailCard icon={User} label="Buyer" value={r.user_name} sub={r.user_email} />
                <DetailCard icon={Package} label="Quantity" value={`${r.quantity || 1} units`} />
                <DetailCard icon={CreditCard} label="Total Amount" value={`Rs. ${Number(r.total_amount || 0).toLocaleString()}`} />
                <DetailCard icon={Phone} label="Phone" value={r.phone || 'N/A'} />
                <DetailCard icon={MapPin} label="Address" value={r.address || 'N/A'} />
                <DetailCard icon={Image} label="Payment Screenshot" value={r.payment_screenshot ? <img src={r.payment_screenshot} alt="Payment" className="w-24 h-24 object-cover rounded-lg cursor-pointer" onClick={() => window.open(r.payment_screenshot, '_blank')} /> : 'Not uploaded'} />
                <DetailCard icon={MessageSquare} label="Payment Method" value={r.payment_method || 'N/A'} />
                <DetailCard icon={MessageSquare} label="Message" value={r.message || 'No message'} />
                <DetailCard icon={FileText} label="Admin Notes" value={r.admin_notes || 'No notes'} />
              </div>
              {trackingHistory.length > 0 && (
                <div className="px-6 pb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    Tracking Timeline
                  </h4>
                  <div className="space-y-0">
                    {trackingHistory.map((entry, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full border-2 ${
                            idx === trackingHistory.length - 1
                              ? 'bg-primary border-primary'
                              : 'bg-gray-200 border-gray-300'
                          }`} />
                          {idx < trackingHistory.length - 1 && (
                            <div className="w-0.5 h-full min-h-[24px] bg-gray-200" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-medium text-gray-900">
                            {trackingLabels[entry.status] || entry.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </p>
                          <p className="text-xs text-gray-500">{entry.note || ''}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {entry.date ? new Date(entry.date).toLocaleString() : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && modalAction && (
          <BuyRequestModal
            action={modalAction}
            item={showModal}
            onClose={() => { setShowModal(null); setModalAction(null); }}
            onConfirm={handleAction}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {trackingModal && (
          <BuyRequestTrackingModal
            request={trackingModal.request}
            nextStage={trackingModal.nextStage}
            onClose={() => setTrackingModal(null)}
            onConfirm={handleTracking}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function BuyRequestTrackingModal({ request, nextStage, onClose, onConfirm, loading }) {
  const [note, setNote] = useState('');
  return (
    <ModalOverlay onClose={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Update Tracking</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-1">
          Product: <span className="text-gray-900 font-medium">{request.product_name}</span>
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Move to: <span className="text-blue-600 font-semibold">{trackingLabels[nextStage] || nextStage}</span>
        </p>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Optional note for this tracking update..."
          rows={3}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 resize-none mb-3" />
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-100 transition-all">
            Cancel
          </button>
          <button onClick={() => onConfirm(request.id, nextStage, note || undefined)} disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Update to {trackingLabels[nextStage] || nextStage}
          </button>
        </div>
      </motion.div>
    </ModalOverlay>
  );
}

function BuyRequestModal({ action, item, onClose, onConfirm, loading }) {
  const [notes, setNotes] = useState('');
  const isApprove = action === 'approve';

  return (
    <ModalOverlay onClose={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{isApprove ? 'Approve Purchase' : 'Reject Purchase'}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-1">Product: <span className="text-gray-900 font-medium">{item.product_name}</span></p>
        <p className="text-xs text-gray-400 mb-4">by {item.user_name || item.user_email}</p>
        {!isApprove && (
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Reason for rejection (optional)" rows={3}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 resize-none mb-3" />
        )}
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-100 transition-all">
            Cancel
          </button>
          <button onClick={() => onConfirm(item.id, isApprove ? 'approved' : 'rejected', isApprove ? undefined : (notes || undefined))} disabled={loading}
            className={`px-5 py-2 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${
              isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isApprove ? 'Approve' : 'Reject'}
          </button>
        </div>
      </motion.div>
    </ModalOverlay>
  );
}

function SupplierProductModal({ action, item, onClose, onConfirm, loading }) {
  const [notes, setNotes] = useState('');
  const isApprove = action === 'approve';

  return (
    <ModalOverlay onClose={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-100 border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{isApprove ? 'Approve Product' : 'Reject Product'}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2A2A40] rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-1">Product: <span className="text-white font-medium">{item.name}</span></p>
        <p className="text-xs text-gray-500 mb-4">by {item.supplier_name || item.supplier_email}</p>
        {!isApprove && (
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Reason for rejection (optional)" rows={3}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600 resize-none mb-3" />
        )}
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-300 text-sm rounded-xl hover:bg-[#2A2A40] transition-all">
            Cancel
          </button>
          <button onClick={() => onConfirm(item.id, isApprove ? 'approved' : 'rejected', isApprove ? undefined : (notes || undefined))} disabled={loading}
            className={`px-5 py-2 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${
              isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isApprove ? 'Approve' : 'Reject'}
          </button>
        </div>
      </motion.div>
    </ModalOverlay>
  );
}

/* Ã¢â€Â¬Ã¢â€Â¬Ã¢â€Â¬ Contact Messages Tab Ã¢â€Â¬Ã¢â€Â¬Ã¢â€Â¬ */
function ContactMessagesTab({ messages, loadMessages, showToast }) {
  const [search, setSearch] = useState('');
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = messages.filter(m => {
    const matchesSearch = !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase()) ||
      m.message?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await api.contactMessages.reply(id, replyText.trim());
      showToast('Reply sent successfully');
      setReplyModal(null);
      setReplyText('');
      await loadMessages();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message permanently?')) return;
    try {
      await api.contactMessages.delete(id);
      showToast('Message deleted');
      await loadMessages();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Contact Messages</h3>
            <p className="text-xs text-gray-400 mt-0.5">{messages.length} total &middot; {messages.filter(m => m.status === 'new' || m.status === 'pending').length} unread</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50">
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="replied">Replied</option>
              <option value="pending">Pending</option>
            </select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search messages..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/50">
                {['Name', 'Email', 'Subject', 'Message', 'Status', 'Reply', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-gray-500 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-gray-400">{search ? 'No matching messages' : 'No messages yet'}</td></tr>
              ) : (
                filtered.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-200 hover:bg-gray-100/50 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="text-gray-900 text-sm font-medium">{m.name || 'N/A'}</p>
                      {m.phone && <p className="text-gray-600 text-[10px]">{m.phone}</p>}
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs">{m.email || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-900 text-xs font-medium max-w-[150px] truncate">{m.subject || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs max-w-[200px] truncate">{m.message}</td>
                    <td className="px-5 py-4"><StatusBadge status={m.status} /></td>
                    <td className="px-5 py-4 text-gray-500 text-xs max-w-[150px] truncate">{m.admin_reply || '-'}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <ActionBtn label="Reply" color="blue" onClick={() => { setReplyText(''); setReplyModal(m); }} />
                        <button onClick={() => handleDelete(m.id)}
                          className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10" title="Delete">
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
      </div>

      <AnimatePresence>
        {replyModal && (
          <ModalOverlay onClose={() => setReplyModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reply to {replyModal.name}</h3>
                <button onClick={() => setReplyModal(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 font-medium">Subject: <span className="text-gray-900">{replyModal.subject}</span></p>
                <p className="text-xs text-gray-500 font-medium mt-1">From: <span className="text-gray-900">{replyModal.name} ({replyModal.email})</span></p>
                <p className="text-sm text-gray-700 mt-3 border-t border-gray-200 pt-3">{replyModal.message}</p>
              </div>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Type your reply..." rows={4}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-400 resize-none mb-4" />
              <div className="flex items-center gap-3 justify-end">
                <button onClick={() => setReplyModal(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-100 transition-all">Cancel</button>
                <button onClick={() => handleReply(replyModal.id)} disabled={sending || !replyText.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-primary to-primary-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
}

function QuotesTab({ quotes, loadQuotes, showToast }) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = quotes.filter(q =>
    !search || q.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
    q.email?.toLowerCase().includes(search.toLowerCase()) ||
    q.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (id, status) => {
    setActionLoading(true);
    try {
      await api.quotes.updateStatus(id, status, adminNote || undefined);
      showToast(`Quote ${status}`);
      setStatusModal(null);
      setAdminNote('');
      setStatusText('');
      await loadQuotes();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quote?')) return;
    try {
      await api.quotes.delete(id);
      showToast('Quote deleted');
      await loadQuotes();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quote Requests</h3>
            <p className="text-xs text-gray-400 mt-0.5">{quotes.length} total &middot; {quotes.filter(q => q.status === 'new').length} new</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotes..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:bg-white transition-all" />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-10 text-center"><p className="text-sm text-gray-400">No quotes found</p></div>
          ) : filtered.map(q => (
            <div key={q.id}>
              <div className="p-4 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{q.buyer_name}</p>
                      <p className="text-xs text-gray-500 truncate">{q.email} &middot; {q.product_name || `Product #${q.product_id}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={q.status} />
                    <span className="text-[10px] text-gray-400">{timeAgo(q.created_at)}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${expandedId === q.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {expandedId === q.id && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <DetailCard icon={Mail} label="Email" value={q.email} />
                    <DetailCard icon={Phone} label="Phone" value={q.phone} />
                    <DetailCard icon={ShoppingBag} label="Quantity" value={q.quantity} />
                    <DetailCard icon={Hash} label="Product ID" value={q.product_id} />
                  </div>
                  {q.business_name && <DetailCard icon={User} label="Business" value={q.business_name} />}
                  {q.message && <DetailCard icon={FileText} label="Message" value={q.message} />}
                  {q.admin_note && <DetailCard icon={MessageSquare} label="Admin Note" value={q.admin_note} />}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {q.status !== 'read' && (
                      <ActionBtn label="Mark Read" color="blue" onClick={() => handleStatusChange(q.id, 'read')} />
                    )}
                    {q.status !== 'replied' && (
                      <ActionBtn label="Mark Replied" color="green" onClick={() => handleStatusChange(q.id, 'replied')} />
                    )}
                    {q.status !== 'closed' && (
                      <ActionBtn label="Close" color="red" onClick={() => handleStatusChange(q.id, 'closed')} />
                    )}
                    <ActionBtn label="Delete" color="red" onClick={() => handleDelete(q.id)} />
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Add admin note..."
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-primary" />
                    <button onClick={async () => {
                      if (!adminNote.trim()) return;
                      setActionLoading(true);
                      try {
                        await api.quotes.updateStatus(q.id, q.status || 'new', adminNote);
                        showToast('Note added');
                        setAdminNote('');
                        await loadQuotes();
                      } catch (e) { showToast(e.message, 'error'); }
                      finally { setActionLoading(false); }
                    }} disabled={actionLoading || !adminNote.trim()}
                      className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50">
                      {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Note'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Shared Components ───────────────────────────────── */

function ActionBtn({ label, color, icon: Icon, onClick }) {
  const colors = { green: 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20', red: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20', blue: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20' };
  return (
    <button onClick={onClick} className={`px-2.5 py-1.5 border rounded-lg text-[11px] font-semibold transition-all ${colors[color] || colors.blue}`}>
      {Icon ? <Icon className="w-3.5 h-3.5" /> : label}
    </button>
  );
}

function StatusBadge({ status }) {
  const style = statusStyles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style}`}>
      {status ? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'N/A'}
    </span>
  );
}

function DetailCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2.5 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-sm text-gray-900 font-medium">{value || 'N/A'}</div>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
            <div className="w-10 h-10 bg-[#2A2A40] rounded-xl mb-3" />
            <div className="h-6 bg-[#2A2A40] rounded w-2/3 mb-2" />
            <div className="h-3 bg-[#2A2A40] rounded w-1/2" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
        <div className="h-5 bg-[#2A2A40] rounded w-1/4 mb-4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-[#2A2A40]/50 rounded-lg mb-2" />
        ))}
      </div>
    </div>
  );
}

/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Modals ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */

function ActionModal({ type, item, onClose, onConfirm, loading }) {
  const titles = { confirm: 'Confirm Order', reject: 'Reject Order', delete: 'Delete Order', tracking: 'Update Tracking' };
  const messages = {
    confirm: `Are you sure you want to confirm order #ORD-${String(item.id).padStart(6, '0')}?`,
    reject: `Reject order #ORD-${String(item.id).padStart(6, '0')}?`,
    delete: `This will permanently delete order #ORD-${String(item.id).padStart(6, '0')}.`,
  };

  return (
    <ModalOverlay onClose={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-100 border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{titles[type] || 'Confirm'}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2A2A40] rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400">{messages[type] || 'Are you sure?'}</p>
        <div className="flex items-center gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-300 text-sm rounded-xl hover:bg-[#2A2A40] transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`px-5 py-2 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${
              type === 'confirm' ? 'bg-green-600 hover:bg-green-700' : type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {type === 'confirm' ? 'Confirm' : type === 'delete' ? 'Delete' : 'Proceed'}
          </button>
        </div>
      </motion.div>
    </ModalOverlay>
  );
}

function InquiryModal({ action, inquiry, onClose, onConfirm, loading }) {
  const [notes, setNotes] = useState('');
  const [ref, setRef] = useState('');
  const isApprove = action === 'approve';

  return (
    <ModalOverlay onClose={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-100 border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{isApprove ? 'Approve Inquiry' : 'Reject Inquiry'}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2A2A40] rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">Item: <span className="text-white font-medium">{inquiry.item_name}</span></p>
        {isApprove ? (
          <input type="text" value={ref} onChange={e => setRef(e.target.value)}
            placeholder="Supplier reference (optional)" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600 mb-3" />
        ) : (
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Admin notes (optional)" rows={3}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600 resize-none mb-3" />
        )}
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-300 text-sm rounded-xl hover:bg-[#2A2A40] transition-all">
            Cancel
          </button>
          <button onClick={() => onConfirm(inquiry.id, isApprove ? 'approved' : 'rejected', isApprove ? undefined : notes, isApprove ? (ref || undefined) : undefined)} disabled={loading}
            className={`px-5 py-2 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${
              isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isApprove ? 'Approve' : 'Reject'}
          </button>
        </div>
      </motion.div>
    </ModalOverlay>
  );
}

function DiscountModal({ action, item, onClose, onConfirm, loading }) {
  const [reply, setReply] = useState('');
  const isApprove = action === 'approve';

  return (
    <ModalOverlay onClose={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-100 border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{isApprove ? 'Approve Discount' : 'Reject Discount'}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2A2A40] rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-1">From: <span className="text-white font-medium">{item.user_name || item.user_email}</span></p>
        <p className="text-xs text-gray-500 mb-4">Message: {item.message}</p>
        <textarea value={reply} onChange={e => setReply(e.target.value)}
          placeholder="Admin reply (optional)" rows={3}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary/50 placeholder:text-gray-600 resize-none mb-3" />
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-300 text-sm rounded-xl hover:bg-[#2A2A40] transition-all">
            Cancel
          </button>
          <button onClick={() => onConfirm(item.id, isApprove ? 'approved' : 'rejected', reply || undefined)} disabled={loading}
            className={`px-5 py-2 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 ${
              isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isApprove ? 'Approve' : 'Reject'}
          </button>
        </div>
      </motion.div>
    </ModalOverlay>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </motion.div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
