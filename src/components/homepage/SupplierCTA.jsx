'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SupplierCTA() {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-24 bg-black text-white">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_62%)]" />
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-white/[0.04] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-white/[0.04] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="relative max-w-[1400px] mx-auto px-4 sm:px-6 text-center"
      >
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            viewport={{ once: true }}
            className="font-playfair font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight"
          >
            Are You a <span className="italic font-light">Supplier?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-white/60 text-base sm:text-lg mt-5 mb-8 max-w-2xl mx-auto leading-relaxed"
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
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-md hover:bg-neutral-100 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] group"
            >
              Register as a Supplier
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/50 text-white font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-md hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}