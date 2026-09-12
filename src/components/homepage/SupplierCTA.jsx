'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SupplierCTA() {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20 bg-[linear-gradient(115deg,#7A5A17_0%,#C6962F_25%,#E9C766_50%,#C6962F_75%,#7A5A17_100%)] bg-[length:220%_220%] animate-cta-drift">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(46,32,16,0.07),transparent_60%)]" />
      </div>

      <div
        className="animate-cta-sheen absolute top-[-30%] left-[-25%] h-[160%] w-[120px] opacity-0 pointer-events-none bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.3)_50%,rgba(255,255,255,0))] skew-x-[-16deg]"
        aria-hidden="true"
      />
      <div className="noise-bg absolute inset-0 mix-blend-overlay opacity-40 pointer-events-none" aria-hidden="true" />

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
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 border border-[#2E2010]/25 text-[#2E2010] text-sm font-medium rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-[#2E2010] rounded-full animate-pulse-dot" />
            Growing Network
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E2010] mb-4"
          >
            Are You a <span>Supplier?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-[#3A2A10]/85 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
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
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#251C12] text-[#F1E7D3] font-bold rounded-2xl hover:bg-[#3B2A1C] active:bg-[#4E3826] transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(23,15,6,0.6)] hover:shadow-[0_14px_36px_-12px_rgba(23,15,6,0.7)] hover:-translate-y-1 active:scale-[0.98] text-base sm:text-lg group"
            >
              Register as a Supplier
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#2E2010]/40 text-[#2E2010] font-semibold rounded-2xl hover:border-[#251C12] hover:bg-[#251C12] hover:text-[#E9C766] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}