'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Globe, Shield, TrendingUp, Users, Award, Zap, Quote } from 'lucide-react';
import Link from 'next/link';
import ScrollProgress from '../../components/b2b/ScrollProgress';
import ModelViewer3D from '../../components/homepage/ModelViewer3D';
import WhyCoreCollective from '../../components/homepage/WhyCoreCollective';

const EASE = [0.16, 1, 0.3, 1];
const CAP_MODEL_SRC = 'https://izqxsfuyibbzwdxdcmev.supabase.co/storage/v1/object/public/3d%20models/free_hat.glb';

const values = [
  { icon: Shield, title: 'Trust & Transparency', desc: 'Every supplier is verified. Every transaction is tracked. We build trust through transparency.' },
  { icon: TrendingUp, title: 'Growth Focused', desc: 'We help businesses scale with competitive wholesale pricing and flexible order quantities.' },
  { icon: Globe, title: 'Global Reach', desc: 'Connect with suppliers and buyers across 30+ countries with seamless cross-border logistics.' },
  { icon: Users, title: 'Community First', desc: 'We\'re building more than a marketplace — we\'re building a community of businesses helping each other grow.' },
  { icon: Award, title: 'Quality Assured', desc: 'Rigorous supplier vetting and quality checks ensure you get what you pay for, every time.' },
  { icon: Zap, title: 'Fast & Efficient', desc: 'Streamlined ordering, instant quotes, and dedicated support to keep your business moving.' },
];

const journey = [
  { year: '2019', title: 'The Idea', desc: 'Core Collective started with a simple belief — wholesale sourcing should be simple, fair, and transparent.' },
  { year: '2021', title: 'Verified Network', desc: 'We launched supplier verification and trusted storefronts, building buyer confidence from day one.' },
  { year: '2023', title: 'Going Global', desc: 'Cross-border logistics opened the marketplace to 30+ countries with currency-safe Paddle payments.' },
  { year: '2026', title: '10,000+ Products', desc: 'Today we power thousands of B2B deals every month across electronics, apparel, home, and more.' },
];

function HeroSection() {
  const reduced = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-[#FAF9F6] border-b border-gray-100 pb-16 pt-24 sm:pb-24 sm:pt-[9rem]">
      <span className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-black via-neutral-300 to-black" />
      <span aria-hidden className="pointer-events-none absolute -top-10 right-0 sm:right-10 font-volkhov italic font-bold text-[10rem] sm:text-[20rem] leading-none text-black/[0.04] select-none">
        Est. 2019
      </span>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <nav className="mb-8 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
          <Link href="/" className="transition-colors hover:text-black">Home</Link>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="text-black">About Us</span>
        </nav>

        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
          <Quote className="w-3.5 h-3.5 text-black" />
          Our Story
        </span>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-6 max-w-4xl font-volkhov font-bold text-4xl leading-[1.05] tracking-tight text-black sm:text-6xl lg:text-7xl"
        >
          The marketplace built
          <span className="block italic text-neutral-500">for serious business</span>
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg"
        >
          We connect verified suppliers with businesses worldwide to make wholesale sourcing simple,
          transparent, and efficient — one trusted deal at a time.
        </motion.p>
      </div>
    </section>
  );
}

function MissionSection() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-24 md:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Our Mission</span>
          <h2 className="mt-4 font-volkhov text-3xl font-bold leading-tight text-black sm:text-4xl">
            Empowering businesses with
            <span className="italic text-neutral-500"> seamless wholesale sourcing</span>
          </h2>
          <div className="mt-6 h-[2px] w-16 bg-black" />
          <p className="mt-6 leading-relaxed text-gray-600">
            Core Collective was founded to solve the biggest challenges in B2B commerce — finding reliable
            suppliers, negotiating fair prices, and managing bulk orders across borders. We combine
            technology with deep industry expertise to create a marketplace where businesses can source
            with confidence.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Whether you&rsquo;re a small retailer or a large distributor, our platform gives you access to
            vetted suppliers, competitive wholesale pricing, and the tools you need to grow your business.
          </p>
          <blockquote className="mt-8 border-l-2 border-black pl-6 font-volkhov italic text-xl text-neutral-700">
            &ldquo;Trust is our product. Every verification, every order, every payout is built on it.&rdquo;
          </blockquote>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
          className="relative w-full"
        >
          <span aria-hidden className="pointer-events-none absolute -right-2 -top-8 font-volkhov italic font-bold text-[8rem] leading-none text-black/[0.05] select-none sm:-right-4 sm:text-[10rem]">
            3D
          </span>
          <div className="relative rounded-[2rem] border border-gray-200 bg-[#FAF9F6] p-3 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.45)] sm:p-4">
            <div className="relative aspect-square overflow-hidden rounded-[1.5rem]">
              <ModelViewer3D src={CAP_MODEL_SRC} alt="Interactive 3D model of a cap" />
              <div className="pointer-events-none absolute left-1/2 top-5 z-30 -translate-x-1/2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 shadow-sm backdrop-blur">
                Interactive 3D cap
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>Drag to rotate and explore the model</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function JourneySection() {
  const reduced = useReducedMotion();
  return (
    <section className="bg-[#FAF9F6] border-t border-b border-gray-100 py-16 sm:py-24 relative overflow-hidden">
      <span aria-hidden className="pointer-events-none absolute -bottom-10 left-0 font-volkhov italic font-bold text-[12rem] leading-none text-black/[0.03] select-none">
        2019
      </span>
      <div className="mx-auto max-w-[1400px] px-4 py-2 sm:px-6 md:px-8">
        <div className="mb-14 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Our Journey</span>
          <h2 className="mt-4 font-volkhov text-3xl font-bold text-black sm:text-4xl">
            The road <span className="italic text-neutral-500">so far</span>
          </h2>
          <div className="mx-auto mt-6 h-[2px] w-16 bg-black" />
        </div>

        <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map((item, idx) => (
            <motion.div
              key={item.year}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: EASE }}
              className="relative"
            >
              <span className="font-volkhov italic font-bold text-4xl text-black">{item.year}</span>
              <span className="mt-3 mb-4 block h-[2px] w-10 bg-black" />
              <h3 className="font-volkhov text-lg font-bold text-black">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValuePoint({ value, index }) {
  const reduced = useReducedMotion();
  const Icon = value.icon;
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: EASE }}
      className="group flex items-start gap-6 sm:gap-10 py-8 border-b border-gray-200 last:border-b-0"
    >
      <span className="font-volkhov italic font-bold text-4xl sm:text-5xl text-gray-200 group-hover:text-black/20 transition-colors duration-300 w-12 shrink-0">
        0{index + 1}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-black shrink-0" />
          <h3 className="font-volkhov text-xl font-bold text-black sm:text-2xl group-hover:text-neutral-600 transition-colors duration-300">
            {value.title}
          </h3>
        </div>
        <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-gray-600">{value.desc}</p>
      </div>
    </motion.div>
  );
}

function ValuesSection() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-24 md:px-8">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="mb-14 text-center"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Our Values</span>
        <h2 className="mt-4 font-volkhov text-3xl font-bold text-black sm:text-4xl">
          What we <span className="italic text-neutral-500">stand for</span>
        </h2>
        <div className="mx-auto mt-6 h-[2px] w-16 bg-black" />
      </motion.div>
      <div className="mx-auto max-w-3xl">
        {values.map((v, i) => <ValuePoint key={v.title} value={v} index={i} />)}
      </div>
    </section>
  );
}

function CtaSection() {
  const reduced = useReducedMotion();
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 sm:pb-28 md:px-8">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative overflow-hidden rounded-[2rem] bg-black px-8 py-14 text-white sm:px-16 sm:py-20"
      >
        <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 text-[15rem] font-volkhov italic font-bold leading-none text-white/[0.05] select-none">
          CC
        </span>
        <span className="pointer-events-none absolute left-1/4 bottom-0 h-px w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Core Collective</span>
            <h2 className="mt-4 font-volkhov text-3xl font-bold leading-tight text-white sm:text-4xl">
              Ready to grow
              <span className="italic text-neutral-400"> your business?</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-300 sm:text-base">
              Join thousands of businesses sourcing products on Core Collective — or start selling yours.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center rounded-full bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:bg-neutral-200 active:scale-[0.98]"
            >
              Browse Products
            </Link>
            <Link
              href="/supplier/signup"
              className="inline-flex items-center rounded-full border border-white/30 px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:border-white hover:bg-white/10 active:scale-[0.98]"
            >
              Become a Supplier
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-jost text-black pt-24 sm:pt-28">
      <ScrollProgress />
      <HeroSection />
      <MissionSection />
      <WhyCoreCollective />
      <JourneySection />
      <ValuesSection />
      <CtaSection />
    </div>
  );
}