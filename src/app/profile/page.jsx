'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Phone, Shield, LogOut, ChevronDown, Store, LayoutDashboard, ShoppingBag, ArrowUpRight, BadgeCheck, Pencil, X, Check, Loader2, MapPin, Briefcase, Calendar, Globe, User, Camera, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const EASE = [0.16, 1, 0.3, 1];

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const base = parts.length >= 2 ? parts[0][0] + parts[1][0] : (name.trim()[0] || '?');
  return base.toUpperCase();
}

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all duration-200';

function FieldInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 py-5 border-b border-gray-100 last:border-b-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-700 shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">{label}</p>
        <p className="mt-1 text-[0.95rem] font-medium text-gray-900 break-words">{value || 'Not provided'}</p>
      </div>
    </div>
  );
}

function EditableField({ label, name, value, type = 'text', textarea = false, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          rows={3}
          onChange={onChange}
          placeholder={`Add ${label.toLowerCase()}...`}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Add ${label.toLowerCase()}...`}
          className={inputClass}
        />
      )}
    </label>
  );
}

function QuickAction({ href, icon: Icon, title, desc, onClick, danger, delay = 0 }) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      className={`group flex w-full items-center justify-between px-6 py-5 rounded-2xl border bg-[#FAF9F6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-18px_rgba(0,0,0,0.3)] ${
        danger ? 'border-red-200 hover:border-red-400' : 'border-gray-200 hover:border-black'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform duration-300 group-hover:scale-110 ${danger ? 'bg-red-600' : 'bg-black'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className={`font-volkhov text-lg font-bold ${danger ? 'text-red-600' : 'text-gray-900'}`}>{title}</p>
          <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <ArrowUpRight className={`w-5 h-5 shrink-0 opacity-40 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${danger ? 'text-red-600' : 'text-gray-900'}`} />
    </motion.div>
  );

  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{inner}</button>;
  }
  return <Link href={href} className="block">{inner}</Link>;
}

export default function ProfilePage() {
  const router = useRouter();

  const { isAdmin, isSupplier, loading: authLoading } = useAuth();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    city: '',
    country: '',
    company: '',
    job_title: '',
    address: '',
    about: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

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
        const meta = user.user_metadata || {};
        setForm({
          full_name: meta.full_name || user.email?.split('@')[0] || '',
          phone: meta.phone || '',
          date_of_birth: meta.date_of_birth || '',
          city: meta.city || '',
          country: meta.country || '',
          company: meta.company || '',
          job_title: meta.job_title || '',
          address: meta.address || '',
          about: meta.about || '',
        });
        setAccount({
          id: user.id,
          email: user.email,
          full_name: meta.full_name || user.email?.split('@')[0] || 'User',
          phone: meta.phone || '',
          date_of_birth: meta.date_of_birth || '',
          joiningDate: meta.joiningDate || user.created_at || '',
          role: isAdmin ? 'Admin' : isSupplier ? 'Supplier' : 'Buyer',
          emailConfirmed: !!user.email_confirmed_at,
        });
        setAvatarUrl(meta.avatar_url || '');
        // The profiles table is the source of truth for the stored link.
        supabase.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle()
          .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url); })
          .catch(() => {});
      }
      setLoading(false);
    }).catch(() => {
      if (active) router.push('/login');
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [authLoading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!['jpg', 'jpeg', 'jfif', 'png', 'webp'].includes(ext)) {
      setSaveMsg('Picture must be a .jpg, .jpeg, .jfif, .png or .webp file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveMsg('Picture must be smaller than 5 MB.');
      return;
    }

    setUploadingAvatar(true);
    setSaveMsg('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in again.');

      // Path must start with the user id — the storage RLS policy checks it.
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(publicUrl);

      const { error: metaError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (metaError) throw metaError;

      const { error: profileError } = await supabase.from('profiles')
        .upsert({ id: user.id, email: user.email, avatar_url: publicUrl }, { onConflict: 'id' });
      if (profileError) throw profileError;

      setSaveMsg('Profile picture updated successfully.');
    } catch (err) {
      setSaveMsg(err.message || 'Could not upload the picture. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setSaveMsg('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && avatarUrl) {
        const path = avatarUrl.split('/avatars/')[1];
        if (path) await supabase.storage.from('avatars').remove([decodeURIComponent(path)]);
      }
      setAvatarUrl('');
      await supabase.auth.updateUser({ data: { avatar_url: '' } });
      if (user) {
        await supabase.from('profiles').upsert({ id: user.id, avatar_url: '' }, { onConflict: 'id' });
      }
    } catch (err) {
      setSaveMsg(err.message || 'Could not remove the picture.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.dispatchEvent(new CustomEvent('authExpired'));
    router.push('/');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const { error } = await supabase.auth.updateUser({
        data: { ...form, joiningDate: account?.joiningDate || undefined },
      });
      if (error) throw error;

      try {
        await supabase.from('profiles').upsert({
          id: account?.id,
          email: account?.email,
          full_name: form.full_name,
          phone: form.phone,
          city: form.city,
          country: form.country || 'Pakistan',
          date_of_birth: form.date_of_birth,
          company: form.company,
          job_title: form.job_title,
          address: form.address,
          bio: form.about,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (tableErr) {
        console.warn('Profiles table sync skipped:', tableErr.message);
      }

      const { data: { user } } = await supabase.auth.getUser();
      window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
      setAccount((prev) => ({
        ...prev,
        full_name: form.full_name || prev.full_name,
        phone: form.phone,
        date_of_birth: form.date_of_birth,
      }));
      setEditing(false);
      setSaveMsg('Profile updated successfully.');
    } catch (err) {
      setSaveMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setSaveMsg('');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveMsg('');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-transparent"
            style={{ borderTopColor: '#000', borderRightColor: '#000', borderLeftColor: 'rgba(0,0,0,0.15)' }}
          />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  const joinedText = account?.joiningDate
    ? new Date(account.joiningDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';

  const firstLine = (account?.full_name || 'User').split(' ').slice(0, -1).join(' ') || 'Welcome';
  const lastWord = (account?.full_name || 'User').split(' ').pop() || 'to Core';

  return (
    <div className="min-h-screen bg-white font-jost text-black pb-20 pt-24 sm:pt-[9rem]">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-[#FAF9F6] border-b border-gray-100">
        <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-black via-neutral-300 to-black" />
        <span aria-hidden className="pointer-events-none absolute -top-14 right-4 sm:right-16 font-volkhov italic font-bold text-[12rem] sm:text-[18rem] leading-none text-black/[0.04] select-none">
          {initialsOf(account?.full_name)}
        </span>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-14 sm:py-20">
          <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-8">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronDown className="w-3 h-3 -rotate-90" />
            <span className="text-black">My Profile</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center gap-7 lg:gap-10 justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-7 sm:gap-10 min-w-0">
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 160, damping: 14 }}
                className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-full bg-black text-white flex items-center justify-center shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5)] group"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={account?.full_name || 'Profile'}
                    className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="font-volkhov italic font-bold text-4xl sm:text-5xl">{initialsOf(account?.full_name)}</span>
                )}
                <span aria-hidden className="absolute -inset-1.5 rounded-full border border-dashed border-black/30" />

                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.jfif,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleAvatarFile} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
                  title="Change profile picture"
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-black border-2 border-white text-white flex items-center justify-center hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-md">
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.6, ease: EASE }}
                className="min-w-0"
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
                  <BadgeCheck className="w-3.5 h-3.5 text-black" />
                  Member Account
                </span>
                <h1 className="mt-4 font-volkhov font-bold text-4xl sm:text-5xl lg:text-6xl text-black leading-[1.05] tracking-tight">
                  {firstLine}
                  <span className="block italic text-neutral-500">{lastWord}</span>
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full bg-black text-white">
                    <Shield className="w-3.5 h-3.5" />
                    {account?.role}
                  </span>
                  {account?.emailConfirmed && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-200">
                      Verified
                    </span>
                  )}
                </div>
                <p className="mt-5 text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
                  Welcome back to your Core Collective account. Keep your details updated so orders, payments, and support stay fast and accurate.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
              className="shrink-0"
            >
              {!editing ? (
                <button
                  onClick={startEdit}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.4)] transition-all active:scale-[0.98] shadow-md group"
                >
                  <Pencil className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-gray-300 bg-white text-gray-700 text-xs font-bold uppercase tracking-[0.2em] hover:border-black hover:text-black transition-all active:scale-[0.98]"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="profile-form"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ CONTENT ============ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-14 sm:py-20">
        {saveMsg && (
          <div className={`mb-8 flex items-center justify-between gap-4 px-5 py-4 rounded-xl border text-sm ${
            saveMsg.startsWith('Profile updated')
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <span className="flex items-center gap-2">
              {saveMsg.startsWith('Profile updated') ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {saveMsg}
            </span>
            <button onClick={() => setSaveMsg('')} className="shrink-0 text-current/60 hover:text-current transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Personal information */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
            className="lg:col-span-2"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Personal Information</span>
                <h2 className="mt-3 font-volkhov font-bold text-3xl sm:text-4xl text-black tracking-tight">
                  Your <span className="italic text-neutral-500">details</span>
                </h2>
                <div className="mt-4 h-[2px] w-16 bg-black" />
              </div>
            </div>

            {!editing ? (
              <>
                <div className="mt-8 max-w-2xl bg-[#FAF9F6] border border-gray-200 rounded-3xl px-7 py-3 sm:px-9">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-700 shrink-0">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Profile Picture</p>
                        <p className="mt-1 text-[0.95rem] font-medium text-gray-900 break-all">
                          {avatarUrl ? avatarUrl : 'No picture uploaded'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 text-[10px] font-bold uppercase tracking-[0.15em] hover:border-black hover:text-black transition-all disabled:opacity-50">
                        {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                        {uploadingAvatar ? 'Uploading' : avatarUrl ? 'Replace' : 'Upload'}
                      </button>
                      {avatarUrl && (
                        <button type="button" onClick={handleAvatarRemove}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 text-[10px] font-bold uppercase tracking-[0.15em] hover:border-red-400 hover:text-red-600 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                    <FieldInfo icon={Mail} label="Email Address" value={account?.email} />
                    <FieldInfo icon={Phone} label="Phone Number" value={account?.phone} />
                    <FieldInfo icon={Calendar} label="Date of Birth" value={account?.date_of_birth} />
                    <FieldInfo icon={Shield} label="Account Role" value={account?.role} />
                    <FieldInfo icon={MapPin} label="City" value={form.city} />
                    <FieldInfo icon={Globe} label="Country" value={form.country} />
                    <FieldInfo icon={Briefcase} label="Company" value={form.company} />
                    <FieldInfo icon={User} label="Job Title" value={form.job_title} />
                  </div>
                  {form.address && (
                    <div className="py-5 border-t border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Address</p>
                      <p className="mt-1 text-[0.95rem] font-medium text-gray-900 break-words">{form.address}</p>
                    </div>
                  )}
                  {form.about && (
                    <div className="py-5 border-t border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">About Me</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-700">{form.about}</p>
                    </div>
                  )}
                  <p className="py-5 border-t border-gray-100 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Member Since {joinedText}
                  </p>
                </div>
              </>
            ) : (
              <form id="profile-form" onSubmit={handleSave} className="mt-8 max-w-2xl">
                <div className="rounded-3xl bg-[#FAF9F6] border border-gray-200 p-7 sm:p-10 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <EditableField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} />
                    <EditableField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} />
                    <EditableField label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
                    <EditableField label="City" name="city" value={form.city} onChange={handleChange} />
                    <EditableField label="Country" name="country" value={form.country} onChange={handleChange} />
                    <EditableField label="Company" name="company" value={form.company} onChange={handleChange} />
                    <EditableField label="Job Title" name="job_title" value={form.job_title} onChange={handleChange} />
                  </div>
                  <EditableField label="Billing Address" name="address" value={form.address} textarea onChange={handleChange} />
                  <EditableField label="About Me" name="about" value={form.about} textarea onChange={handleChange} />
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Email address cannot be changed here.</p>
                  </div>
                </div>
              </form>
            )}
          </motion.section>

          {/* Quick actions */}
          <section className="lg:pt-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Quick Actions</span>
            <h2 className="mt-3 font-volkhov font-bold text-2xl sm:text-3xl text-black tracking-tight">
              Jump <span className="italic text-neutral-500">back in</span>
            </h2>
            <div className="mt-4 h-[2px] w-16 bg-black" />
            <div className="mt-7 space-y-4">
              <QuickAction href="/orders" icon={ShoppingBag} title="My Orders" desc="Track your purchases" delay={0.1} />
              <QuickAction href="/notifications" icon={Mail} title="Notifications" desc="See updates & alerts" delay={0.16} />
              {isSupplier && (
                <QuickAction href="/supplier/dashboard" icon={Store} title="Supplier Dashboard" desc="Manage your products" delay={0.22} />
              )}
              {isAdmin && (
                <QuickAction href="/admin" icon={LayoutDashboard} title="Admin Panel" desc="Manage the marketplace" delay={0.28} />
              )}
              <QuickAction icon={LogOut} title="Logout" desc="Sign out of your account" onClick={handleLogout} danger delay={0.34} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}