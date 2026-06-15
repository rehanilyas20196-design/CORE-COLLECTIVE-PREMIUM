'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-20, 20, -20],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
  },
};

function InputField({ icon: Icon, label, type = 'text', value, onChange, placeholder, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div variants={itemVariants}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focused ? 'text-primary' : 'text-gray-400'}`} />
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/5 hover:border-gray-400" />
      </div>
      {error && <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-red-500 text-xs mt-1">{error}</motion.p>}
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (user) {
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
      }
      if (user?.email === 'rehanilyas20196@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Invalid email or password' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"
      />
      <motion.div
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        custom={1}
        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[130px] pointer-events-none"
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
              Welcome back
            </motion.h1>
            <motion.p variants={itemVariants} className="text-gray-500 text-sm mt-1">
              Sign in to your account
            </motion.p>
          </motion.div>

          <motion.form
            onSubmit={handleLogin}
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required
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

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}

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
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader className="w-5 h-5" />
                </motion.span>
              ) : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </motion.form>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <p className="text-gray-500 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:text-primary-600 font-medium transition-colors relative group">
                Create one
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </p>
          </motion.div>

          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Link href="/supplier/login" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors group">
              Supplier login
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
