'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Store, Package, Users, MapPin } from 'lucide-react';
import ModelViewer3D from './ModelViewer3D';

function useCountUp(target, duration = 2) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let start = 0;
          const increment = Math.ceil(target / (duration * 60));
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatRow({ value, label, icon: Icon }) {
  const num = parseInt(value.replace(/,/g, ''), 10);
  const suffix = value.replace(/[\d,]/g, '');
  const { count, ref } = useCountUp(num);

  return (
    <motion.div
      variants={itemVariants}
      ref={ref}
      className="flex items-center gap-5 py-6 border-b border-[#1C1814]/10 last:border-b-0"
    >
      <div className="w-11 h-11 rounded-full border border-amber-200/80 bg-white flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#C9922E]" strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[#C9922E] text-[2rem] font-bold leading-none font-['DM_Mono',monospace] tracking-tight">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-[#8A8375] text-[11px] uppercase tracking-[0.18em] mt-1.5">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

const stats = [
  { value: '10000', label: 'Trusted Suppliers', icon: Store },
  { value: '50000', label: 'Products Listed', icon: Package },
  { value: '25000', label: 'Happy Buyers', icon: Users },
  { value: '500', label: 'Cities Covered', icon: MapPin },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function StatsSection() {
  return (
    <section className="relative py-20 sm:py-28 bg-[#F5F1EA] overflow-hidden">
      {/* Subtle decorative shapes */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-200/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[320px] h-[320px] bg-amber-100/40 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left: 3D Model */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-1"
          >
            <div className="relative rounded-[2rem] overflow-hidden border border-[#E7E0D3] bg-white/60 shadow-[0_35px_70px_-20px_rgba(28,24,20,0.24)]">
              <div className="aspect-square">
                <ModelViewer3D src="https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/3d%20models/free_hat.glb" />
              </div>
            </div>

            {/* Floating caption */}
            <div className="absolute -bottom-5 left-6 right-6 sm:left-10 sm:right-auto z-20 inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur border border-[#E7E0D3] rounded-full shadow-lg shadow-amber-900/10">
              <span className="w-2 h-2 rounded-full bg-[#C9922E]" />
              <span className="text-[#6B665E] text-xs font-medium">Interactive 3D Product Render</span>
            </div>
          </motion.div>

          {/* Right: Philosophy */}
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="order-2 lg:pl-8"
          >
            {/* Eyebrow: line + dot + label */}
            <div className="flex items-center gap-4 mb-7">
              <span className="w-12 h-px bg-[#C9922E]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9922E]" />
              <span className="text-[#C9922E] text-xs font-semibold tracking-[0.25em] uppercase">
                Our Philosophy
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-[#1C1814]">
              Built on{' '}
              <span className="font-playfair italic font-medium text-[#C9922E]">Trust</span>
            </h2>

            <p className="text-[#6B665E] text-base sm:text-lg leading-relaxed mt-6 max-w-[520px]">
              We believe commerce thrives on trust. Every supplier in our network is manually vetted, every order is tracked end-to-end, and every transaction is protected &mdash; because your business deserves trading partners it can rely on.
            </p>

            {/* Stats as vertical editorial list */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="mt-12"
            >
              {stats.map((stat) => (
                <StatRow key={stat.label} {...stat} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}