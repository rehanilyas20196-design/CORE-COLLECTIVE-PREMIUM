'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SupplierCTA() {

  return (
    <section
      className="py-16 sm:py-20 bg-gradient-to-r from-amber-800 via-star to-amber-600 relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-star/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="relative max-w-[1400px] mx-auto px-4 sm:px-6 text-center"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-star/10 text-star text-sm font-medium rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-star rounded-full animate-pulse-dot" />
            Growing Network
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Are You a{' '}
            <span className="text-white">
              Supplier?
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-200 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Join Pakistan&apos;s fastest-growing B2B marketplace. List your products and connect
            with thousands of buyers looking for quality wholesale products.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/supplier/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-star text-white font-bold rounded-2xl hover:bg-yellow-500 active:bg-yellow-600 transition-all duration-300 shadow-lg shadow-star/25 hover:shadow-xl hover:shadow-star/30 hover:-translate-y-1 active:scale-[0.98] text-base sm:text-lg group"
            >
              Register as a Supplier
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:border-white hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
