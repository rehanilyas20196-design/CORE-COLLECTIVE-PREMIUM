'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const suppliers = [
  {
    name: 'TechHub Pakistan',
    location: 'Lahore, Pakistan',
    categories: ['Electronics', 'Mobile Accessories'],
    products: 340,
  },
  {
    name: 'FashionWorld Karachi',
    location: 'Karachi, Pakistan',
    categories: ['Clothing', 'Fashion'],
    products: 520,
  },
  {
    name: 'HomeComfort Ltd',
    location: 'Islamabad, Pakistan',
    categories: ['Home Goods', 'Furniture'],
    products: 280,
  },
  {
    name: 'Guangzhou Trade Co.',
    location: 'Guangzhou, China',
    categories: ['Electronics', 'Industrial'],
    products: 1200,
  },
  {
    name: 'SportsPro Industries',
    location: 'Sialkot, Pakistan',
    categories: ['Sports Equipment', 'Leather'],
    products: 190,
  },
  {
    name: 'BeautyHub Pakistan',
    location: 'Lahore, Pakistan',
    categories: ['Health & Beauty', 'Cosmetics'],
    products: 450,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function IconSparkle({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2zM19 16l.9 2.6L22.5 19.5l-2.6.9L19 23l-.9-2.6-2.6-.9 2.6-.9L19 16z" />
    </svg>
  );
}

function IconChevronLeft({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function IconMapPin({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconPackage({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconArrow({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function IconPlus({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

const noiseTexture =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function useCountUp(target, duration = 1000) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);

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

function VerifiedMedallion() {
  return (
    <span className="relative w-5 h-5 flex-shrink-0 inline-flex items-center justify-center">
      <span
        className="absolute -inset-[3px] rounded-full border border-[#7C5A25]/50 opacity-0 scale-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100"
        aria-hidden
      />
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
        style={{
          background: 'radial-gradient(circle at 35% 28%, #FFFBEE 0%, #FFF4D6 48%, #EBCE9A 100%)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.95), inset 0 -1px 2px rgba(122,90,40,0.45)',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#6B4B1E" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
          <path d="M4 12l5 5L20 7" />
        </svg>
      </span>
    </span>
  );
}

function SupplierCard({ sup }) {
  const [display, countRef] = useCountUp(sup.products);

  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex-shrink-0 w-[340px] sm:w-[400px] min-h-[240px] rounded-[22px] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:rotate-[-0.6deg] shadow-[0_10px_30px_-10px_rgba(122,90,40,0.35),inset_0_1px_0_rgba(255,251,238,0.9),inset_0_-2px_8px_rgba(122,90,40,0.18)] hover:shadow-[0_24px_50px_-12px_rgba(104,74,32,0.5),inset_0_1px_0_rgba(255,251,238,1),inset_0_-3px_10px_rgba(122,90,40,0.22)]"
    >
      {/* Gold gradient surface */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #FBE7B8 0%, #EFCB84 55%, #D9AE5F 100%)' }}
      />

      {/* Grain noise overlay */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.16] pointer-events-none"
        style={{ backgroundImage: noiseTexture }}
      />

      {/* Bevel: top ivory highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#FFF4D6]/80 pointer-events-none" />

      {/* Top accent line (ivory default, gold draws in on hover) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFFBEE] to-[#FFF4D6] pointer-events-none" />
      <div className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[#7C5A25] to-[#B98A3C] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out pointer-events-none" />

      {/* Corner brackets */}
      <span className="absolute top-3.5 left-3.5 w-4 h-4 border-t border-l border-[#7C5A25]/50 rounded-tl-[6px] pointer-events-none" />
      <span className="absolute bottom-3.5 right-3.5 w-4 h-4 border-b border-r border-[#7C5A25]/50 rounded-br-[6px] pointer-events-none" />

      {/* Shimmer sweep */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 bottom-0 left-0 w-1/2 -skew-x-12 -translate-x-[160%] group-hover:translate-x-[320%] transition-transform duration-[950ms] ease-out bg-gradient-to-r from-transparent via-[#FFFBEE]/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-7 flex flex-col h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="font-fraunces font-semibold text-lg text-[#3A2410] truncate leading-snug">
              {sup.name}
            </h4>
            <VerifiedMedallion />
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-1.5">
          <IconMapPin />
          <span className="text-[#6B4B1E] text-xs">{sup.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {sup.categories.map((cat, idx) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-full bg-[#FFFBEE]/85 text-[#6B4B1E] text-[11px] font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
              style={{ transitionDelay: `${idx * 120}ms` }}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="mt-5 mb-4 h-px bg-[#7C5A25]/30 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <IconPackage className="text-[#6B4B1E]" />
            <span className="font-semibold text-sm text-[#3A2410]">
              <span ref={countRef}>{display.toLocaleString()}</span>+ products
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#6B4B1E] group-hover:text-[#7C5A25] transition-colors duration-300">
            View profile
            <IconArrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function SupplierSpotlight() {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 15);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 15);
  };

  const scrollByAmount = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 420, behavior: 'smooth' });
  };

  const handleWheel = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    const canScrollX = el.scrollWidth > el.clientWidth + 10;
    if (!canScrollX) return;
    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(updateArrows);
    const el = scrollRef.current;
    el?.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    const timeout = setTimeout(updateArrows, 600);
    return () => {
      cancelAnimationFrame(raf);
      el?.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <section
      className="relative py-16 sm:py-24 font-jost overflow-hidden bg-[#F3EDDF]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(58,36,16,0.035) 0px, rgba(58,36,16,0.035) 1px, transparent 1px, transparent 14px)',
      }}
    >
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-14"
        >
          <div className="flex items-center justify-center gap-4">
            <span aria-hidden className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#B98A3C]/60" />
            <div className="flex items-center gap-2">
              <IconSparkle className="w-4 h-4 text-[#B98A3C]" />
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-[#93692A]">
                Trusted Partners
              </span>
            </div>
            <span aria-hidden className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#B98A3C]/60" />
          </div>
          <h2 className="mt-4 font-fraunces font-bold text-[32px] sm:text-[40px] lg:text-[44px] tracking-[-0.02em] leading-tight text-[#2A2318]">
            Our Verified{' '}
            <span className="italic text-[#B98A3C] font-medium">Supplier</span> Network
          </h2>
          <p className="text-[#5C5344] text-base sm:text-lg mt-3 max-w-xl mx-auto">
            Every supplier is manually verified for quality, reliability, and compliance
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-end gap-3 mb-5">
            <button
              onClick={() => scrollByAmount(-1)}
              disabled={!canLeft}
              aria-label="Scroll suppliers left"
              className="w-11 h-11 rounded-full bg-[#FFFBEE] border border-[#B98A3C]/40 text-[#93692A] flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#B98A3C] hover:border-[#B98A3C] hover:text-[#FFF4D6] shadow-[0_2px_8px_rgba(122,90,40,0.15)]"
            >
              <IconChevronLeft />
            </button>
            <button
              onClick={() => scrollByAmount(1)}
              disabled={!canRight}
              aria-label="Scroll suppliers right"
              className="w-11 h-11 rounded-full bg-[#FFFBEE] border border-[#B98A3C]/40 text-[#93692A] flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#B98A3C] hover:border-[#B98A3C] hover:text-[#FFF4D6] shadow-[0_2px_8px_rgba(122,90,40,0.15)]"
            >
              <IconChevronRight />
            </button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            ref={scrollRef}
            onWheel={handleWheel}
            className="flex gap-5 overflow-x-auto pb-6 no-scrollbar"
          >
            {suppliers.map((sup) => (
              <SupplierCard key={sup.name} sup={sup} />
            ))}

            <Link
              href="/supplier/signup"
              className="group relative flex-shrink-0 w-[340px] sm:w-[400px] min-h-[240px] rounded-[22px] p-8 cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center bg-[#3B2A1C] border-2 border-dashed border-[#B98A3C]/50 transition-all duration-500 hover:border-[#B98A3C] hover:bg-[#4E3826]"
            >
              <motion.div variants={cardVariants} className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-[#B98A3C]/15 border border-[#B98A3C]/30 flex items-center justify-center mx-auto mb-5 text-[#E9C97B] group-hover:bg-[#B98A3C] group-hover:text-[#FFF4D6] transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                  <IconPlus />
                </div>
                <h4 className="font-fraunces font-semibold text-lg text-[#FBF8F0] mb-2">
                  Become a Verified Supplier
                </h4>
                <p className="text-[#FBF8F0]/65 text-sm mb-4">
                  Join our growing network of trusted suppliers
                </p>
                <span className="inline-flex items-center gap-2 text-[#E9C97B] text-sm font-medium group-hover:gap-3 group-hover:text-[#FFFBEE] transition-all duration-300">
                  Register Now &rarr;
                </span>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}