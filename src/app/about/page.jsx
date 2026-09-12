'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Globe, Shield, TrendingUp, Users, Award, Zap } from 'lucide-react';
import ScrollProgress from '../../components/b2b/ScrollProgress';
import SectionHeading from '../../components/b2b/SectionHeading';
import ShimmerButton from '../../components/b2b/ShimmerButton';
import TiltCard from '../../components/b2b/TiltCard';
import GoldSweep from '../../components/b2b/GoldSweep';

const EASE = [0.16, 1, 0.3, 1];

const stats = [
  { label: 'Products Listed', value: '10,000+' },
  { label: 'Verified Suppliers', value: '500+' },
  { label: 'Countries Served', value: '30+' },
  { label: 'Years in Business', value: '5+' },
];

const values = [
  { icon: Shield, title: 'Trust & Transparency', desc: 'Every supplier is verified. Every transaction is tracked. We build trust through transparency.' },
  { icon: TrendingUp, title: 'Growth Focused', desc: 'We help businesses scale with competitive wholesale pricing and flexible order quantities.' },
  { icon: Globe, title: 'Global Reach', desc: 'Connect with suppliers and buyers across 30+ countries with seamless cross-border logistics.' },
  { icon: Users, title: 'Community First', desc: 'We\'re building more than a marketplace — we\'re building a community of businesses helping each other grow.' },
  { icon: Award, title: 'Quality Assured', desc: 'Rigorous supplier vetting and quality checks ensure you get what you pay for, every time.' },
  { icon: Zap, title: 'Fast & Efficient', desc: 'Streamlined ordering, instant quotes, and dedicated support to keep your business moving.' },
];

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
    <section className="relative overflow-hidden bg-[#FBF7EE] pb-16 pt-28 sm:pb-24 sm:pt-36 lg:pb-28">
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="absolute -right-24 -top-24 h-[480px] w-[480px] rounded-full bg-[#C08A2E]/15 blur-[120px]" />
      <div className="absolute -left-24 bottom-0 h-[420px] w-[420px] rounded-full bg-[#E9C04D]/10 blur-[110px]" />
      <div className="absolute left-1/2 top-1/3 h-[300px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-[#C08A2E]/10 to-transparent blur-[90px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#5C5344]">
          <a href="/" className="transition-colors hover:text-[#A9762A]">Home</a>
          <ChevronDown className="h-3 w-3 -rotate-90 text-[#C08A2E]/60" />
          <span className="text-[#A9762A]">About</span>
        </nav>

        <motion.h1
          initial={reduced ? false : 'hidden'}
          animate="visible"
          variants={headline}
          className="max-w-4xl font-fraunces text-[40px] font-semibold leading-[1.06] tracking-[-0.02em] text-[#1D1911] sm:text-6xl lg:text-7xl"
        >
          <span className="block overflow-hidden pb-1">
            <motion.span variants={line} className="block">About Core</motion.span>
          </span>
          <span className="block overflow-hidden pb-3">
            <motion.span variants={line} className="block bg-gradient-to-r from-[#9C6A26] via-[#D9A648] to-[#C08A2E] bg-clip-text pr-4 italic text-transparent">
              Collective
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
          className="mt-5 max-w-2xl text-lg leading-relaxed text-[#5C5344] sm:text-xl"
        >
          We connect verified suppliers with businesses worldwide to make wholesale sourcing simple, transparent, and efficient.
        </motion.p>
      </div>
    </section>
  );
}

function MissionSection() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="inline-flex items-center rounded-full border border-[rgba(192,138,46,0.4)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#9C6A26]">
            Our Mission
          </span>
          <h2 className="mt-5 font-fraunces text-[28px] font-semibold tracking-[-0.01em] text-[#1D1911] sm:text-4xl">
            Empowering businesses with seamless wholesale sourcing
          </h2>
          <p className="mt-6 leading-relaxed text-[#5C5344]">
            Core Collective was founded to solve the biggest challenges in B2B commerce — finding reliable suppliers, negotiating fair prices, and managing bulk orders across borders. We combine technology with deep industry expertise to create a marketplace where businesses can source with confidence.
          </p>
          <p className="mt-4 leading-relaxed text-[#5C5344]">
            Whether you're a small retailer or a large distributor, our platform gives you access to vetted suppliers, competitive wholesale pricing, and the tools you need to grow your business.
          </p>
          <div className="mt-8 h-px w-24 bg-gradient-to-r from-[#C08A2E]/70 to-transparent" aria-hidden="true" />
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
          className="[perspective:1000px]"
        >
          <TiltCard maxTilt={7} className="h-full">
            <div
              className="relative rounded-3xl border border-[rgba(192,138,46,0.18)] bg-[#FFFDF8] p-8 shadow-[0_18px_50px_-12px_rgba(29,25,17,0.12)] sm:p-10"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h3
                className="flex items-center gap-3 font-fraunces text-xl font-semibold text-[#1D1911]"
                style={{ transform: 'translateZ(26px)' }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#E9C04D] to-[#C08A2E] font-fraunces text-sm text-[#FFFDF8] shadow-[0_6px_16px_-4px_rgba(192,138,46,0.5)]">
                  CC
                </span>
                At a Glance
              </h3>

              <div className="mt-8 grid grid-cols-2 gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} style={{ transform: 'translateZ(16px)' }}>
                    <p className="bg-gradient-to-r from-[#9C6A26] to-[#C08A2E] bg-clip-text font-fraunces text-3xl font-semibold text-transparent">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-sm text-[#5C5344]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}

function ValueCard({ value, index }) {
  const reduced = useReducedMotion();
  const Icon = value.icon;
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: EASE }}
      className="h-full"
    >
      <TiltCard maxTilt={10} className="group h-full">
        <div
          className="relative h-full rounded-2xl border border-[rgba(192,138,46,0.18)] bg-[#FFFDF8] p-7 transition-colors duration-300 group-hover:border-[#C08A2E]/50 group-hover:shadow-[0_16px_44px_-12px_rgba(192,138,46,0.35)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C08A2E]/10 text-[#A9762A] transition-colors duration-300 group-hover:bg-gradient-to-br group-hover:from-[#E9C04D] group-hover:to-[#C08A2E] group-hover:text-white"
            style={{ transform: 'translateZ(42px)' }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h3
            className="font-fraunces text-lg font-semibold text-[#1D1911]"
            style={{ transform: 'translateZ(30px)' }}
          >
            {value.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#5C5344]" style={{ transform: 'translateZ(14px)' }}>
            {value.desc}
          </p>
        </div>
      </TiltCard>
    </motion.div>
  );
}

function ValuesSection() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <SectionHeading eyebrow="Our Values" title="What we stand for" />
      </motion.div>
      <div className="grid gap-6 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3">
        {values.map((v, i) => <ValueCard key={v.title} value={v} index={i} />)}
      </div>
    </section>
  );
}

function CtaSection() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(120deg,#241A0E_0%,#100D08_55%,#2E1F0E_100%)] px-6 py-12 sm:px-12 sm:py-16"
      >
        <GoldSweep />
        <div className="absolute inset-0 noise-bg opacity-[0.07]" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C08A2E]/60 to-transparent" aria-hidden="true" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#D9A648]">Core Collective</p>
            <h2 className="mt-3 font-fraunces text-3xl font-semibold text-[#FFFDF8] sm:text-4xl">
              Ready to grow your business?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#E8DFCF]/70 sm:text-base">
              Join thousands of businesses sourcing products on Core Collective.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <ShimmerButton href="/products">Browse Products</ShimmerButton>
            <a
              href="/supplier/signup"
              className="inline-flex items-center border border-[#D9A648]/60 px-8 py-4 text-sm font-semibold tracking-wide text-[#EADFBF] transition-all duration-300 hover:border-[#D9A648] hover:bg-[#D9A648]/10"
            >
              Become a Supplier
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FBF7EE] font-inter text-[#1D1911]">
      <ScrollProgress />
      <HeroSection />
      <MissionSection />
      <ValuesSection />
      <CtaSection />
    </div>
  );
}