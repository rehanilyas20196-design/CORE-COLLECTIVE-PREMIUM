'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-15, 15, -15],
    transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
  },
};

function InputField({ icon: Icon, label, type = 'text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div variants={itemVariants}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focused ? 'text-primary' : 'text-gray-400'}`} />
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/5 hover:border-gray-400" />
      </div>
    </motion.div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Please fill in all required fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name, phone: form.phone || null },
        },
      });
      if (authError) throw authError;
      if (data?.user?.identities?.length === 0) {
        setError('An account with this email already exists');
        return;
      }
      setSuccess(true);
    } catch (err) {
      if (err.message?.includes('already registered')) setError('An account with this email already exists');
      else setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-xl shadow-gray-200/50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-gray-900 mb-2"
          >
            Account created!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 text-sm mb-6"
          >
            Check your email for a confirmation link to activate your account.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all">
              Go to Sign In
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <motion.div
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"
      />
      <motion.div
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[130px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <motion.div
          className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.div
            className="text-center mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                <motion.img
                  src="https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/Background/Logo/Core%20Collective%20(1).png"
                  alt="Core Collective"
                  className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
                  whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
                />
              </Link>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500"
            >
              Create your account
            </motion.h1>
            <motion.p variants={itemVariants} className="text-gray-500 text-sm mt-1">
              Join Core Collective as a buyer
            </motion.p>
          </motion.div>

          <motion.form
            onSubmit={handleSignup}
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <InputField icon={User} label="Full Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="John Doe" />
            <InputField icon={Mail} label="Email *" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="you@example.com" />
            <InputField icon={Phone} label="Phone (optional)" type="tel" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+92 300 000 0000" />
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" required
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/5 hover:border-gray-400" />
                <motion.button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
            </motion.div>
            <InputField icon={Lock} label="Confirm Password *" type="password" value={form.confirmPassword} onChange={v => setForm(p => ({ ...p, confirmPassword: v }))} placeholder="Repeat your password" />

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}

            <motion.p variants={itemVariants} className="text-xs text-gray-400">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </motion.p>

            <motion.button
              type="submit" disabled={loading}
              variants={itemVariants}
              whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(201, 151, 75, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 inline-flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={loading ? {} : { x: ['100%', '-100%'], transition: { duration: 2, repeat: Infinity, ease: 'linear' } }}
              />
              {loading ? (
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader className="w-5 h-5" />
                </motion.span>
              ) : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </motion.form>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary-600 font-medium transition-colors relative group">
                Sign in
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </p>
          </motion.div>

          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <Link href="/supplier/signup" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors group">
              Register as a supplier
              <motion.span
                className="inline-block"
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ArrowRight className="w-3 h-3" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
