'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { ChevronDown, Store, DollarSign, BarChart3, Globe, Shield, HeadphonesIcon, Users, Package, TrendingUp } from 'lucide-react';
import ScrollProgress from '../../components/b2b/ScrollProgress';
import SectionHeading from '../../components/b2b/SectionHeading';
import ShimmerButton from '../../components/b2b/ShimmerButton';
import GoldSweep from '../../components/b2b/GoldSweep';

const EASE = [0.16, 1, 0.3, 1];

const benefits = [
  { icon: Globe, title: 'Global Exposure', desc: 'Showcase your products to thousands of active buyers across 30+ countries.' },
  { icon: DollarSign, title: 'Fair Pricing', desc: 'Set your own prices and margins. No hidden fees, no commission surprises.' },
  { icon: BarChart3, title: 'Sales Analytics', desc: 'Track views, inquiries, and orders with real-time analytics dashboard.' },
  { icon: Shield, title: 'Verified Badge', desc: 'Stand out with a verified supplier badge that builds buyer trust.' },
  { icon: HeadphonesIcon, title: 'Dedicated Support', desc: 'Get priority support from our supplier success team.' },
  { icon: Store, title: 'Storefront', desc: 'Create a branded storefront to showcase your full product catalog.' },
];

const steps = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up as a supplier and complete your profile with business details.' },
  { num: '02', title: 'Get Verified', desc: 'Our team reviews your business documents and verifies your credentials.' },
  { num: '03', title: 'List Your Products', desc: 'Upload your catalog with pricing, MOQs, and product details.' },
  { num: '04', title: 'Start Selling', desc: 'Receive inquiries, negotiate deals, and fulfill orders.' },
];

const stats = [
  { icon: Store, value: '500+', label: 'Active Suppliers' },
  { icon: Package, value: '10,000+', label: 'Products Listed' },
  { icon: Users, value: '50,000+', label: 'Buyers' },
  { icon: TrendingUp, value: '95%', label: 'Satisfaction Rate' },
];

const testimonials = [
  { quote: 'Core Collective helped us expand our reach to international buyers we could never access before.', name: 'Ali Hassan', role: 'CEO, TechGrow Industries' },
  { quote: 'The verification process was smooth, and we started receiving inquiries within a week of listing our products.', name: 'Sana Malik', role: 'Founder, StyleCraft Textiles' },
  { quote: 'The analytics dashboard gives us real insights into what buyers are looking for. Invaluable for planning production.', name: 'Imran Shah', role: 'Director, PackMart Solutions' },
];

const faqs = [
  { q: 'How long does verification take?', a: 'Most applications are reviewed within 48 hours. We\'ll notify you via email once your account is verified.' },
  { q: 'Are there any listing fees?', a: 'No. Creating an account and listing products is completely free. We only charge a small commission on completed orders.' },
  { q: 'How do I get paid?', a: 'Payments are processed securely through Paddle (Visa, Mastercard, PayPal, Apple Pay, Google Pay and more). Payouts are released once the buyer confirms delivery.' },
  { q: 'Can I set my own prices?', a: 'Absolutely. You have full control over your pricing, MOQs, and shipping terms. We provide market insights to help you stay competitive.' },
];

const PARTICLES = [
  { left: '6%', top: '28%', size: 5, delay: 0, duration: 11, drift: 18 },
  { left: '14%', top: '66%', size: 3, delay: 1.4, duration: 9, drift: -14 },
  { left: '24%', top: '18%', size: 6, delay: 0.8, duration: 13, drift: 12 },
  { left: '38%', top: '74%', size: 4, delay: 2.2, duration: 10, drift: -20 },
  { left: '52%', top: '24%', size: 3, delay: 1.1, duration: 12, drift: 16 },
  { left: '64%', top: '62%', size: 5, delay: 0.4, duration: 9, drift: -12 },
  { left: '76%', top: '34%', size: 4, delay: 1.8, duration: 14, drift: 10 },
  { left: '88%', top: '58%', size: 3, delay: 0.6, duration: 11, drift: -16 },
  { left: '94%', top: '20%', size: 5, delay: 2.6, duration: 12, drift: 8 },
  { left: '46%', top: '84%', size: 4, delay: 3.1, duration: 10, drift: 14 },
  { left: '70%', top: '86%', size: 3, delay: 0.2, duration: 13, drift: -10 },
  { left: '30%', top: '88%', size: 5, delay: 1.7, duration: 9, drift: 12 },
];

function GoldParticles() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((pt, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-[#E9C04D] to-[#C08A2E]"
          style={{ left: pt.left, top: pt.top, width: pt.size, height: pt.size }}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={
            reduced
              ? { opacity: 0.35, x: 0, y: 0 }
              : { y: [0, -70, 0], x: [0, pt.drift, 0], opacity: [0, 0.55, 0], scale: [1, 1.3, 0.9] }
          }
          transition={{ duration: pt.duration, delay: pt.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function HeroSection() {
  const reduced = useReducedMotion();
  const headline = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.16, delayChildren: 0.05 } },
  };
  const line = {
    hidden: { y: '112%' },
    visible: { y: 0, transition: { duration: 0.85, ease: EASE } },
  };

  return (
    <section className="relative overflow-hidden bg-[#FBF7EE] pb-14 pt-28 sm:pb-20 sm:pt-36 lg:pb-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[#C08A2E]/15 blur-[110px]" />
      <div className="absolute -left-24 -bottom-32 h-[360px] w-[360px] rounded-full bg-[#E9C04D]/10 blur-[100px]" />
      <GoldParticles />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#5C5344]">
          <a href="/" className="transition-colors hover:text-[#A9762A]">Home</a>
          <ChevronDown className="h-3 w-3 -rotate-90 text-[#C08A2E]/60" />
          <span className="text-[#A9762A]">Suppliers</span>
        </nav>

        <motion.h1
          initial={reduced ? false : 'hidden'}
          animate="visible"
          variants={headline}
          className="max-w-4xl font-fraunces text-[40px] font-semibold leading-[1.06] tracking-[-0.02em] text-[#1D1911] sm:text-6xl lg:text-7xl"
        >
          <span className="block overflow-hidden pb-1">
            <motion.span variants={line} className="block">Partner with</motion.span>
          </span>
          <span className="block overflow-hidden pb-3">
            <motion.span variants={line} className="block bg-gradient-to-r from-[#9C6A26] via-[#D9A648] to-[#C08A2E] bg-clip-text pr-4 italic text-transparent">
              Core Collective
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
          className="mt-5 max-w-2xl text-lg leading-relaxed text-[#5C5344] sm:text-xl"
        >
          Join 500+ verified suppliers reaching thousands of B2B buyers worldwide. Grow your wholesale business with our platform.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.7, ease: EASE }}
          className="mt-8"
        >
          <ShimmerButton />
        </motion.div>
      </div>
    </section>
  );
}

function useCountUp(target, active, reduced, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration, reduced]);

  return value;
}

function Stat({ value, label, icon: Icon }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const target = parseInt(value.replace(/[^\d]/g, ''), 10);
  const suffix = value.replace(/[\d,]/g, '');
  const n = useCountUp(target, inView, reduced);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C08A2E]/10 text-[#A9762A]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="flex items-baseline gap-1 font-fraunces text-[34px] font-semibold leading-none text-[#1D1911] sm:text-4xl">
        <span>{n.toLocaleString()}</span>
        <span className="text-[26px] text-[#C08A2E] sm:text-3xl">{suffix}</span>
      </p>
      <p className="text-sm font-medium uppercase tracking-[0.08em] text-[#8C8271]">{label}</p>
    </div>
  );
}

function StatsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative -mt-6 rounded-3xl border border-[rgba(192,138,46,0.18)] bg-[#FFFDF8] px-6 py-10 shadow-[0_18px_50px_-12px_rgba(29,25,17,0.12)] sm:px-10">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:gap-6">
          {stats.map((s) => <Stat key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ benefit, index }) {
  const reduced = useReducedMotion();
  const Icon = benefit.icon;
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: EASE }}
      className="group relative rounded-2xl border border-[rgba(192,138,46,0.18)] bg-[#FFFDF8] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#C08A2E]/50 hover:shadow-[0_16px_44px_-12px_rgba(192,138,46,0.35)]"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C08A2E]/10 text-[#A9762A] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#E9C04D] group-hover:to-[#C08A2E] group-hover:text-white group-hover:shadow-[0_8px_20px_-6px_rgba(192,138,46,0.5)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-fraunces text-lg font-semibold text-[#1D1911]">{benefit.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#5C5344]">{benefit.desc}</p>
    </motion.div>
  );
}

function BenefitsSection() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <SectionHeading
          eyebrow="Why Join Us"
          title="Benefits for suppliers"
          subtitle="Everything you need to grow your wholesale business in one platform."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => <BenefitCard key={b.title} benefit={b} index={i} />)}
        </div>
      </motion.div>
    </section>
  );
}

function StepsSection() {
  const reduced = useReducedMotion();
  return (
    <section className="bg-[#F3ECDF] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionHeading eyebrow="How It Works" title="Get started in 4 simple steps" />
        </motion.div>

        <div className="relative">
          <div className="sm:hidden absolute bottom-4 left-[21px] top-4 w-[2px] overflow-hidden rounded-full bg-[rgba(192,138,46,0.18)]">
            <motion.div
              className="h-full w-full origin-top rounded-full bg-gradient-to-b from-[#D9A648] to-[#C08A2E]"
              initial={reduced ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
            />
          </div>
          <div className="hidden lg:absolute left-8 right-8 top-[21px] h-[2px] overflow-hidden rounded-full bg-[rgba(192,138,46,0.18)] lg:block">
            <motion.div
              className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[#A9762A] via-[#D9A648] to-[#C08A2E]"
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
            />
          </div>

          <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex items-start gap-5 lg:flex-col lg:items-center lg:text-center">
                <motion.div
                  initial={reduced ? false : { opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: 0.25 + i * 0.2, duration: 0.5, ease: EASE }}
                  className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E9C04D] to-[#C08A2E] font-fraunces text-sm font-semibold text-[#FFFDF8] shadow-[0_8px_20px_-6px_rgba(192,138,46,0.55)]"
                >
                  {step.num}
                </motion.div>
                <div className="lg:mt-5">
                  <h3 className="font-fraunces text-lg font-semibold text-[#1D1911]">{step.title}</h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-[#5C5344]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <SectionHeading eyebrow="Testimonials" title="What our suppliers say" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: EASE }}
            className="flex flex-col rounded-2xl border border-[rgba(192,138,46,0.18)] bg-[#FFFDF8] p-7"
          >
            <span className="font-fraunces text-5xl leading-none text-[#C08A2E]/30">&ldquo;</span>
            <p className="mt-2 flex-1 text-sm italic leading-relaxed text-[#5C5344]">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-6 border-t border-[rgba(192,138,46,0.15)] pt-4">
              <p className="font-fraunces text-[15px] font-semibold text-[#1D1911]">{t.name}</p>
              <p className="text-xs text-[#8C8271]">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
      <SectionHeading eyebrow="Questions" title="Supplier FAQs" />
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <motion.div
            key={faq.q}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
            className="rounded-2xl border border-[rgba(192,138,46,0.18)] bg-[#FFFDF8] p-6"
          >
            <h3 className="font-fraunces text-base font-semibold text-[#1D1911]">{faq.q}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5C5344]">{faq.a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative overflow-hidden rounded-[28px] bg-[#100D08] px-6 py-16 text-center sm:px-12 sm:py-20"
      >
        <GoldSweep />
        <div className="absolute inset-0 noise-bg opacity-[0.07]" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C08A2E]/60 to-transparent" aria-hidden="true" />

        <div className="relative z-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#D9A648]">Core Collective</p>
          <h2 className="mt-4 font-fraunces text-3xl font-semibold text-[#FFFDF8] sm:text-4xl">
            Ready to grow with us?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#E8DFCF]/70 sm:text-base">
            Join 500+ suppliers already selling on Core Collective. Start reaching B2B buyers today.
          </p>
          <div className="mt-8"><ShimmerButton /></div>
        </div>
      </motion.div>
    </section>
  );
}

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-[#FBF7EE] font-inter text-[#1D1911]">
      <ScrollProgress />
      <HeroSection />
      <StatsSection />
      <BenefitsSection />
      <StepsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </div>
  );
}