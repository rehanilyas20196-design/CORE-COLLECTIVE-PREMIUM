'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, Trash2, ArrowLeft, Loader2,
  CheckCircle, XCircle, Info, Hourglass, Filter, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  pending: Hourglass,
};

const colorMap = {
  success: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20',
  error: 'from-red-500/20 to-red-600/10 text-red-400 border-red-500/20',
  info: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/20',
  pending: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/20',
};

export default function NotificationsPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast({ msg, id: Date.now() });
    setTimeout(() => setToast(null), 2500);
  };

  const loadNotifications = useCallback(async () => {
    if (!userProfile?.id) return;
    try {
      setLoading(true);
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/login');
      return;
    }
    if (userProfile?.id) loadNotifications();
  }, [userProfile, authLoading, router, loadNotifications]);

  const filtered = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.is_read : n.is_read
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error(e); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      showToast('All marked as read');
    } catch (e) { showToast(e.message); }
  };

  const handleDelete = async (id) => {
    try {
      await api.notifications.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { showToast(e.message); }
  };

  const handleBulkMarkRead = async () => {
    for (const id of selectedIds) {
      if (!notifications.find(n => n.id === id)?.is_read) {
        await api.notifications.markAsRead(id);
      }
    }
    setNotifications(prev => prev.map(n => selectedIds.has(n.id) ? { ...n, is_read: true } : n));
    setSelectedIds(new Set());
    showToast('Marked as read');
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await api.notifications.delete(id);
    }
    setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    showToast('Deleted');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(n => n.id)));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-2xl text-sm font-semibold"
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 text-gray-500 hover:text-white hover:bg-gray-100 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : notifications.length > 0
                  ? 'All caught up!'
                  : 'No notifications yet'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary text-sm font-semibold rounded-xl hover:bg-primary/20 transition-all">
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </button>
            )}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              {['all', 'unread', 'read'].map(f => (
                <button key={f} onClick={() => { setFilter(f); setSelectedIds(new Set()); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === f ? 'bg-primary text-white' : 'text-gray-500 hover:text-white'
                  }`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bulk actions */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl">
              <span className="text-sm text-white font-medium">{selectedIds.size} selected</span>
              <button onClick={handleBulkMarkRead} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary text-xs font-semibold rounded-lg hover:bg-primary/30 transition-all">
                <CheckCheck className="w-3.5 h-3.5" />
                Mark Read
              </button>
              <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/20 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="ml-auto p-1.5 text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#2A2A40] rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#2A2A40] rounded w-1/3 mb-2" />
                    <div className="h-3 bg-[#2A2A40] rounded w-2/3" />
                  </div>
                  <div className="h-3 bg-[#2A2A40] rounded w-12" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Bell className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {filter === 'all' ? 'No notifications yet' : filter === 'unread' ? 'No unread notifications' : 'No read notifications'}
            </h3>
            <p className="text-sm text-gray-600">
              {filter === 'all'
                ? 'When you get notifications, they will appear here.'
                : filter === 'unread'
                ? 'You have read all notifications.'
                : 'Mark notifications as read to see them here.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif, i) => {
              const Icon = iconMap[notif.type] || Bell;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  layout
                  className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                    notif.is_read
                      ? 'bg-gray-50 border-[#1C1C2E] hover:border-gray-200'
                      : 'bg-white border-primary/20 hover:border-primary/40 shadow-sm'
                  }`}
                >
                  {/* Checkbox for bulk */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(notif.id)}
                      onChange={() => toggleSelect(notif.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-transparent accent-primary cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl border ${colorMap[notif.type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className={`text-sm font-semibold ${notif.is_read ? 'text-gray-400' : 'text-white'}`}>
                          {notif.title}
                        </h4>
                        <p className={`text-xs mt-1 leading-relaxed ${notif.is_read ? 'text-gray-600' : 'text-gray-400'}`}>
                          {notif.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-gray-600 whitespace-nowrap">{timeAgo(notif.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 absolute right-3 -bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-100 border border-gray-200 rounded-xl p-1 shadow-xl">
                    {!notif.is_read && (
                      <button onClick={() => handleMarkAsRead(notif.id)}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Mark as read">
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(notif.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Unread indicator */}
                  {!notif.is_read && (
                    <span className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full animate-pulse-dot" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}
