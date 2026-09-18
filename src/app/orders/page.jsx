'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, ChevronDown, Clock, CheckCircle, Truck, MapPin, PackageCheck, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import OptimizedProductImage from '../../components/products/OptimizedProductImage';

const TRACKING_STAGES = [
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, desc: 'Order confirmed & being prepared' },
  { key: 'shipped', label: 'Shipped', icon: Package, desc: 'Order has been shipped' },
  { key: 'in_transit', label: 'In Transit', icon: Truck, desc: 'Order is in transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin, desc: 'Order is out for delivery' },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck, desc: 'Order delivered successfully' },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-200', dot: 'bg-amber-500', icon: Clock },
  approved: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-600 border-blue-200', dot: 'bg-blue-500', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600 border-red-200', dot: 'bg-red-500', icon: AlertCircle },
};

function TrackingTimeline({ trackingStatus, trackingHistory }) {
  const stages = TRACKING_STAGES;
  const currentIdx = stages.findIndex(s => s.key === trackingStatus);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary" />
        Tracking Progress
      </h4>
      <div className="relative">
        {stages.map((stage, i) => {
          const isCompleted = i <= currentIdx;
          const isCurrent = i === currentIdx;
          const historyEntry = trackingHistory?.find(h => h.status === stage.key);

          return (
            <div key={stage.key} className="flex items-start gap-3 pb-4 relative last:pb-0">
              {i < stages.length - 1 && (
                <div className={`absolute left-[11px] top-6 w-0.5 h-full -z-0 ${
                  isCompleted ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
              <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                isCompleted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
              } ${isCurrent ? 'ring-2 ring-primary/30 ring-offset-2' : ''}`}>
                {isCompleted ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {stage.label}
                  {isCurrent && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Current</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {historyEntry
                    ? `${stage.desc} — ${new Date(historyEntry.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : isCompleted ? stage.desc : 'Awaiting'}
                </p>
                {historyEntry?.note && historyEntry.note !== stage.desc && (
                  <p className="text-[11px] text-gray-400 mt-0.5 italic">{historyEntry.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shrink-0">
            {order.product_image ? (
              <OptimizedProductImage
                src={order.product_image}
                alt={order.product_name}
                sizes="(max-width: 640px) 64px, 80px"
                classN="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingBag className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                  {order.product_name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Qty: {order.quantity} unit{order.quantity > 1 ? 's' : ''}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${status.color}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg font-bold text-gray-900">PKR {Number(order.total_amount || 0).toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {order.phone && (
                <span className="text-gray-400">{order.phone}</span>
              )}
            </div>

            {(order.status === 'approved' || order.status === 'confirmed') && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 inline-flex items-center gap-1.5 text-primary text-xs font-semibold hover:text-primary-700 transition-colors"
              >
                <Truck className="w-3.5 h-3.5" />
                {expanded ? 'Hide Tracking' : 'View Tracking'}
                <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {expanded && (order.status === 'approved' || order.status === 'confirmed') && (
          <TrackingTimeline
            trackingStatus={order.tracking_status || 'confirmed'}
            trackingHistory={order.tracking_history || []}
          />
        )}
      </div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { userProfile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!userProfile) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [userProfile, authLoading]);

  const fetchOrders = async () => {
    try {
      const data = await api.buyRequests.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved' || o.status === 'confirmed').length,
    rejected: orders.filter(o => o.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-14 sm:py-20">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-primary">My Orders</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">
              My Orders
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Track and manage your wholesale purchases
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-3 mt-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700 font-medium">{statusCounts.pending} Pending</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">{statusCounts.approved} Confirmed</span>
            </div>
            {statusCounts.rejected > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 font-medium">{statusCounts.rejected} Rejected</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-4">
        {orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white border border-gray-200 rounded-2xl"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start sourcing products from our verified suppliers</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
