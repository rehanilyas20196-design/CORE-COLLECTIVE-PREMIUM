'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronDown, Store, DollarSign, BarChart3, Globe, Shield, HeadphonesIcon,
  Package, Users, TrendingUp, ArrowRight, ArrowUpRight, CheckCircle2, BadgeCheck, Quote,
} from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1];

const benefits = [
  { icon: Globe, title: 'Global Exposure', desc: 'Showcase your products to thousands of active buyers across 30+ countries.' },
  { icon: DollarSign, title: 'Fair Pricing', desc: 'Set your own prices and margins. No hidden fees, no commission surprises.' },
  { icon: BarChart3, title: 'Sales Analytics', desc: 'Track views, inquiries, and orders with a real-time analytics dashboard.' },
  { icon: Shield, title: 'Verified Badge', desc: 'Stand out with a verified supplier badge that builds buyer trust.' },
  { icon: HeadphonesIcon, title: 'Dedicated Support', desc: 'Get priority support from our supplier success team, every step of the way.' },
  { icon: Store, title: 'Branded Storefront', desc: 'Create a branded storefront to showcase your full product catalog.' },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up as a supplier and complete your profile with business details.' },
  { num: '02', title: 'Get Verified', desc: 'Our team reviews your business documents and verifies your credentials.' },
  { num: '03', title: 'List Products', desc: 'Upload your catalog with pricing, MOQs, and product details.' },
  { num: '04', title: 'Start Selling', desc: 'Receive inquiries, negotiate deals, and fulfill orders.' },
];

const stats = [
  { icon: Store, value: '500+', label: 'Active Suppliers' },
  { icon: Package, value: '10,000+', label: 'Products Listed' },
  { icon: Users, value: '50,000+', label: 'Buyers Network' },
  { icon: TrendingUp, value: '95%', label: 'Satisfaction Rate' },
];

const perks = [
  { label: 'No Listing Fees' },
  { label: 'Monthly Payouts' },
  { label: 'Free Storefront' },
];

function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let raf = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return [display, ref];
}

function StatValue({ value, className }) {
  const match = value.match(/([\d,]+)([^0-9]*)/);
  const num = parseInt((match?.[1] || '0').replace(/,/g, ''), 10);
  const suffix = match?.[2] || '';
  const [display, ref] = useCountUp(num);
  return (
    <p ref={ref} className={className}>
      {display.toLocaleString('en-US')}{suffix}
    </p>
  );
}

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-white font-jost text-black pt-24 sm:pt-28">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-[#FAF9F6] border-b border-gray-100">
        <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-black via-neutral-300 to-black" />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 font-playfair italic font-bold text-[11rem] sm:text-[20rem] leading-none text-black/[0.04] select-none whitespace-nowrap"
        >
          Suppliers
        </span>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-16 pb-16 sm:pt-20 sm:pb-20 text-center">
          <nav className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-7">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronDown className="w-3 h-3 -rotate-90" />
            <span className="text-black">Suppliers</span>
          </nav>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600 mb-6">
            <BadgeCheck className="w-3.5 h-3.5 text-black" />
            Wholesale Network Expansion
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-playfair font-bold text-4xl sm:text-6xl lg:text-7xl text-black leading-[1.05] tracking-tight"
          >
            Grow Your Wholesale
            <span className="block italic font-bold text-neutral-500">Business, Globally</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
            className="mx-auto mt-6 max-w-2xl text-sm sm:text-base leading-relaxed text-gray-600"
          >
            Join 500+ verified suppliers reaching thousands of B2B buyers worldwide. List once, sell everywhere —
            with fair pricing, real analytics, and a team that fights for your store.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/supplier/signup"
              className="inline-flex items-center gap-2 px-9 py-4 bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-[0.22em] rounded-full hover:bg-neutral-800 hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.4)] transition-all active:scale-[0.98] group"
            >
              Become a Supplier
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/supplier/login"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-full border border-gray-300 bg-white text-gray-900 text-xs sm:text-sm font-bold uppercase tracking-[0.22em] hover:border-black hover:bg-black hover:text-white transition-all active:scale-[0.98]"
            >
              Supplier Login
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          >
            {perks.map((perk) => (
              <span key={perk.label} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-black" />
                {perk.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ STATS BAND ============ */}
      <section className="relative bg-black text-white overflow-hidden">
        <span aria-hidden className="pointer-events-none absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent to-white/[0.04]" />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className={`text-center px-4 ${idx !== 0 ? 'lg:border-l lg:border-white/10' : ''} ${idx === 2 ? 'max-lg:border-l max-lg:border-white/10' : ''}`}
              >
                <StatValue
                  value={s.value}
                  className="font-playfair italic font-bold text-4xl sm:text-5xl text-white leading-none"
                />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BENEFITS ============ */}
      <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
        <span aria-hidden className="pointer-events-none absolute -right-24 top-16 font-playfair italic font-bold text-[14rem] leading-none text-black/[0.03] select-none">CC</span>
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
              Why Partner With Us
            </span>
            <h2 className="mt-4 font-playfair font-bold text-3xl sm:text-5xl text-black tracking-tight">
              Everything you need
              <span className="italic text-neutral-500"> to win</span>
            </h2>
            <div className="mx-auto mt-6 h-[2px] w-16 bg-black" />
            <p className="mt-6 text-sm sm:text-base text-gray-500 leading-relaxed">
              Expand your reach and manage wholesale bulk orders efficiently — we handle the platform,
              you run the store.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: idx * 0.06, duration: 0.6, ease: EASE }}
                  className="group flex items-start gap-6 sm:gap-10 py-8 border-b border-gray-200 first:pt-0 last:border-b-0"
                >
                  <span className="font-playfair italic font-bold text-4xl sm:text-5xl text-gray-200 group-hover:text-black/20 transition-colors duration-300 w-12 shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-black shrink-0" />
                      <h3 className="font-playfair font-bold text-xl sm:text-2xl text-black group-hover:text-neutral-600 transition-colors duration-300">
                        {b.title}
                      </h3>
                    </div>
                    <p className="mt-2.5 text-sm sm:text-base text-gray-600 leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ STEPS ============ */}
      <section className="py-20 sm:py-28 bg-[#FAF9F6] border-t border-b border-gray-100 relative overflow-hidden">
        <span aria-hidden className="pointer-events-none absolute -left-20 bottom-0 font-playfair italic font-bold text-[13rem] leading-none text-black/[0.03] select-none">04</span>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
              How It Works
            </span>
            <h2 className="mt-4 font-playfair font-bold text-3xl sm:text-5xl text-black tracking-tight">
              From signup to sales
              <span className="italic text-neutral-500"> in four steps</span>
            </h2>
            <div className="mx-auto mt-6 h-[2px] w-16 bg-black" />
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <span aria-hidden className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gray-300" />
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: idx * 0.1, duration: 0.6, ease: EASE }}
                className="relative bg-white rounded-3xl border border-gray-200 p-7 text-center hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)] hover:-translate-y-1.5 transition-all duration-300"
              >
                <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white font-playfair italic font-bold text-sm ring-4 ring-white">
                  {step.num}
                </span>
                <h3 className="mt-5 font-playfair font-bold text-lg text-black">{step.title}</h3>
                <p className="mt-2.5 text-xs text-gray-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIAL ============ */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.figure
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative text-center"
          >
            <span aria-hidden className="pointer-events-none select-none font-playfair italic font-bold text-[7rem] sm:text-[9rem] leading-none text-black/[0.06]">
              &ldquo;
            </span>
            <blockquote className="relative -mt-10 font-playfair italic text-2xl sm:text-3xl text-neutral-700 leading-snug">
              Core Collective opened our catalog to buyers we could never reach on our own.
              Within three months our B2B orders doubled.
            </blockquote>
            <figcaption className="mt-8 flex flex-col items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white font-playfair italic font-bold text-lg">
                A
              </span>
              <div>
                <p className="text-sm font-bold text-black tracking-wide">Ayesha K.</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mt-1">
                  Verified Supplier, Faisalabad
                </p>
              </div>
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="pb-20 sm:pb-28 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative overflow-hidden rounded-[2rem] bg-black px-8 py-16 sm:px-16 sm:py-20 text-center text-white"
          >
            <span aria-hidden className="pointer-events-none absolute -top-24 -right-16 text-[16rem] font-playfair italic font-bold leading-none text-white/[0.05] select-none">
              CC
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
              <Quote className="w-3.5 h-3.5" />
              Join the network
            </span>
            <h2 className="relative z-10 mt-6 font-playfair font-bold text-3xl sm:text-5xl leading-tight tracking-tight">
              Ready to grow<br />
              <span className="italic text-neutral-400">your wholesale business?</span>
            </h2>
            <p className="relative z-10 mx-auto mt-5 max-w-xl text-sm sm:text-base text-neutral-300">
              Join 500+ suppliers already selling on Core Collective. Start reaching B2B buyers today — free to list, pay only when you sell.
            </p>
            <div className="relative z-10 mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/supplier/signup"
                className="group inline-flex items-center gap-2 px-9 py-4 rounded-full bg-white text-black text-xs sm:text-sm font-bold uppercase tracking-[0.22em] hover:bg-neutral-200 transition-all active:scale-[0.98]"
              >
                Register Now
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-9 py-4 rounded-full border border-white/25 text-white text-xs sm:text-sm font-bold uppercase tracking-[0.22em] hover:border-white hover:bg-white/10 transition-all active:scale-[0.98]"
              >
                Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}