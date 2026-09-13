'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, Shield, LogOut, ChevronDown, Store, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const creamBg = '#EFE3C8';
const cardBg = '#FBF5E8';
const ink = '#2B2013';
const tan = '#7A6A4C';
const goldLight = '#D9A63C';
const goldMid = '#B8862E';
const goldDark = '#8A6A1E';
const goldSoft = 'rgba(140,105,40,0.28)';

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const base = parts.length >= 2 ? parts[0][0] + parts[1][0] : (name.trim()[0] || '?');
  return base.toUpperCase();
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(217,166,60,0.14)', color: goldMid }}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: tan }}>{label}</p>
        <p className="text-[0.95rem] font-medium truncate" style={{ color: ink }}>{value || 'Not provided'}</p>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAdmin, isSupplier, loading: authLoading } = useAuth();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    let active = true;

    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (!active) return;
      if (error || !user) {
        router.push('/login');
        return;
      }
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
      if (active) {
        setAccount({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          phone: user.user_metadata?.phone || '',
          date_of_birth: user.user_metadata?.date_of_birth || '',
          joiningDate: user.user_metadata?.joiningDate || user.created_at || '',
          role: isAdmin ? 'Admin' : isSupplier ? 'Supplier' : 'Buyer',
          emailConfirmed: !!user.email_confirmed_at,
        });
      }
      setLoading(false);
    }).catch(() => {
      if (active) router.push('/login');
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [authLoading, isAdmin, isSupplier, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.dispatchEvent(new CustomEvent('authExpired'));
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: creamBg }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-transparent"
            style={{ borderTopColor: goldMid, borderRightColor: goldLight, borderLeftColor: goldSoft }}
          />
          <p className="text-sm" style={{ color: tan }}>Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  const joinedText = account?.joiningDate
    ? new Date(account.joiningDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="relative w-full overflow-hidden min-h-screen pt-[84px] sm:pt-[96px] md:pt-[100px] pb-16" style={{ backgroundColor: creamBg }}>
      <div className="absolute pointer-events-none" style={{ top: '-180px', right: '-160px', width: '640px', height: '640px', background: 'radial-gradient(circle at 70% 30%, rgba(217,166,60,0.22) 0%, transparent 62%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-200px', left: '-180px', width: '680px', height: '680px', background: 'radial-gradient(circle at 30% 70%, rgba(184,134,46,0.18) 0%, transparent 60%)' }} />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm mb-8" style={{ color: tan }}>
          <Link href="/" className="hover:text-[#8A5A2E] transition-colors font-medium">Home</Link>
          <ChevronDown className="w-3 h-3 -rotate-90" />
          <span style={{ color: goldDark }} className="font-semibold">My Profile</span>
        </motion.nav>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-10"
          style={{ backgroundColor: cardBg, border: `1px solid ${goldSoft}`, boxShadow: '0 30px 80px -30px rgba(80,62,28,0.35)' }}
        >
          <div className="login-gold-line" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Monogram — no avatar icon */}
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 160, damping: 14 }}
              className="relative w-24 h-24 shrink-0 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl"
              style={{ background: 'linear-gradient(140deg, #E4B94A, #B8862E 55%, #8A6A1E)' }}
            >
              <span className="font-fraunces">{initialsOf(account?.full_name)}</span>
              <div className="absolute inset-0 rounded-full ring-2 opacity-40" style={{ borderColor: goldLight, inset: 6 }} />
            </motion.div>

            <div className="text-center sm:text-left flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="font-fraunces text-3xl sm:text-4xl font-semibold"
                style={{ color: ink }}
              >
                {account?.full_name || 'User'}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="flex items-center justify-center sm:justify-start gap-2 mt-2"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm" style={{ background: `linear-gradient(90deg, ${goldLight}, ${goldDark})` }}>
                  <Shield className="w-3.5 h-3.5" />
                  {account?.role}
                </span>
                {account?.emailConfirmed && (
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ color: '#3E7A3E', backgroundColor: 'rgba(62,122,62,0.12)' }}>
                    Verified
                  </span>
                )}
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-[0.95rem]"
                style={{ color: tan }}
              >
                Welcome to your Core Collective account. Below is a summary of your account details.
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Account details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 rounded-3xl p-7 sm:p-9"
          style={{ backgroundColor: cardBg, border: `1px solid ${goldSoft}` }}
        >
          <h2 className="font-fraunces text-xl font-semibold mb-6" style={{ color: ink }}>Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DetailRow icon={Mail} label="Email Address" value={account?.email} />
            <DetailRow icon={Phone} label="Phone Number" value={account?.phone} />
            <DetailRow icon={Shield} label="Account Role" value={account?.role} />
            <DetailRow icon={Calendar} label="Member Since" value={joinedText} />
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Link
            href="/orders"
            className="group rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1"
            style={{ backgroundColor: cardBg, border: `1px solid ${goldSoft}` }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(217,166,60,0.14)', color: goldMid }}>
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: ink }}>My Orders</p>
              <p className="text-xs mt-0.5" style={{ color: tan }}>Track your purchases</p>
            </div>
          </Link>

          {isSupplier && (
            <Link
              href="/supplier/dashboard"
              className="group rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: cardBg, border: `1px solid ${goldSoft}` }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(217,166,60,0.14)', color: goldMid }}>
                <Store className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold" style={{ color: ink }}>Supplier Dashboard</p>
                <p className="text-xs mt-0.5" style={{ color: tan }}>Manage your products</p>
              </div>
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="group rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: cardBg, border: `1px solid ${goldSoft}` }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(217,166,60,0.14)', color: goldMid }}>
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold" style={{ color: ink }}>Admin Panel</p>
                <p className="text-xs mt-0.5" style={{ color: tan }}>Manage the marketplace</p>
              </div>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="group rounded-2xl p-6 flex items-center gap-4 text-left transition-all duration-300 hover:-translate-y-1"
            style={{ backgroundColor: cardBg, border: '1px solid rgba(155,44,44,0.25)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(155,44,44,0.1)', color: '#9B2C2C' }}>
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#9B2C2C' }}>Logout</p>
              <p className="text-xs mt-0.5" style={{ color: tan }}>Sign out of your account</p>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}