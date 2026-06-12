'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, Star, ChevronRight, Users } from 'lucide-react';
import ModelViewer3D from './ModelViewer3D';

const avatars = [
  'https://i.pravatar.cc/100?img=1',
  'https://i.pravatar.cc/100?img=2',
  'https://i.pravatar.cc/100?img=3',
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function HeroSection() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gray-50 pt-24">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-amber-300/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="max-w-xl"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200/60 rounded-full mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#C9974B] animate-pulse" />
              <span className="text-[#C9974B] text-sm font-semibold tracking-wide">
                Pakistan&apos;s #1 B2B Marketplace
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-gray-900"
            >
              Premium B2B Marketplace for{' '}
              <span className="text-[#C9974B]">Verified Suppliers</span>
              {' '}& Buyers in Pakistan
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-gray-600 text-base sm:text-lg mt-6 leading-relaxed max-w-lg"
            >
              Connect with verified suppliers, source quality products at wholesale prices, and grow your business with Core Collective&apos;s trusted marketplace platform.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <button
                onClick={() => router.push('/products')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C9974B] hover:bg-[#D4A853] active:scale-[0.97] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#C9974B]/25 hover:shadow-xl hover:shadow-[#C9974B]/30 text-base"
              >
                <ShoppingBag className="w-5 h-5" />
                Explore Products
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/supplier/signup')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-[#C9974B] hover:text-[#C9974B] hover:bg-amber-50/50 transition-all duration-300 active:scale-[0.97] text-base"
              >
                <Store className="w-5 h-5" />
                Become a Supplier
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-200"
            >
              <div className="flex -space-x-2">
                {avatars.map((src, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white ring-1 ring-gray-200 overflow-hidden"
                  >
                    <img
                      src={src}
                      alt={`User ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C9974B] text-[#C9974B]" />
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 text-sm font-medium">
                <Users className="w-4 h-4 text-[#C9974B]" />
                Trusted by 10,000+ businesses
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <ModelViewer3D src="https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/3d%20models/free_hat.glb" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
