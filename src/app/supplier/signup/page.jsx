'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader, User, Phone, Store, Globe, Building2, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function SupplierSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    companyName: '', companyWebsite: '', businessType: '', productCategories: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.companyName) { setError('Please fill in all required fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            phone: form.phone || null,
            company_name: form.companyName,
            company_website: form.companyWebsite || null,
            business_type: form.businessType || null,
            product_categories: form.productCategories || null,
            role: 'supplier',
            is_supplier: true,
          },
        },
      });
      if (authError) throw authError;
      if (data?.user?.identities?.length === 0) { setError('An account with this email already exists'); return; }
      setSuccess(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError('An account with this email already exists');
      } else if (msg.includes('Database error')) {
        setError('Signup failed due to a database configuration issue. Please run the trigger fix SQL in your Supabase dashboard (see fix_trigger.sql file).');
      } else {
        setError(msg || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Registration submitted!</h2>
          <p className="text-gray-600 text-sm mb-6">Check your email for a confirmation link. Our team will review your application within 48 hours.</p>
          <Link href="/supplier/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all">Go to Supplier Sign In</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-lg">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <img src="https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/Background/Logo/Core%20Collective%20(1).png" alt="Core Collective" className="h-8 w-auto" />
            </Link>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Store className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Become a Supplier</h1>
            <p className="text-gray-600 text-sm mt-1">Join 500+ verified suppliers on Core Collective</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField icon={User} label="Full Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="John Doe" />
              <InputField icon={Phone} label="Phone *" type="tel" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+92 300 000 0000" />
            </div>
            <InputField icon={Mail} label="Email *" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="you@example.com" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" required
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <InputField icon={Lock} label="Confirm Password *" type="password" value={form.confirmPassword} onChange={v => setForm(p => ({ ...p, confirmPassword: v }))} placeholder="Repeat your password" />

            <hr className="border-gray-200" />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Business Details</h3>

            <InputField icon={Building2} label="Company Name *" value={form.companyName} onChange={v => setForm(p => ({ ...p, companyName: v }))} placeholder="Your Company Ltd." />
            <InputField icon={Globe} label="Company Website (optional)" type="url" value={form.companyWebsite} onChange={v => setForm(p => ({ ...p, companyWebsite: v }))} placeholder="https://example.com" />
            <InputField icon={Store} label="Business Type (optional)" value={form.businessType} onChange={v => setForm(p => ({ ...p, businessType: v }))} placeholder="Manufacturer / Distributor / Wholesaler" />
            <InputField icon={Building2} label="Product Categories (optional)" value={form.productCategories} onChange={v => setForm(p => ({ ...p, productCategories: v }))} placeholder="Electronics, Clothing, Furniture" />

            {error && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{error}</motion.p>
            )}

            <p className="text-xs text-gray-500">By registering, you agree to our Terms of Service and Supplier Agreement.</p>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : null}
              {loading ? 'Submitting...' : 'Register as Supplier'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already registered?{' '}
              <Link href="/supplier/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">Sign in</Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/signup" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors">
              Register as a buyer <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ icon: Icon, label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
    </div>
  );
}
