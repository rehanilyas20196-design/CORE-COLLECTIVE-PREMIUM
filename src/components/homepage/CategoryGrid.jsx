'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useScrollReveal, AnimatedSection } from '../../hooks/useScrollReveal';

function IconLaptop({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="16" height="11" rx="1.5" />
      <path d="M2 19h20" />
      <path d="M12 15v4" />
    </svg>
  );
}

function IconShirt({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8.6 3.8 4.2 5.6l1.9 2.8L8 7.5l0 11H16l0-11 1.9 0.9 1.9-2.8-4.4-1.8L14 4.7Q12 6.1 10 4.7Z" />
    </svg>
  );
}

function IconSofa({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4.5" y="5.5" width="15" height="5.5" rx="1.5" />
      <path d="M2.5 14.5v-1.6a2.1 2.1 0 0 1 4.2 0V14.5" />
      <path d="M17.3 14.5v-1.6a2.1 2.1 0 0 1 4.2 0V14.5" />
      <path d="M5 14.5h14v2.3a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z" />
      <path d="M7.5 20.5V18" />
      <path d="M16.5 20.5V18" />
    </svg>
  );
}

function IconBasketball({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M7.2 5.6c2.3 3.4 2.3 9.4 0 12.8" />
      <path d="M16.8 5.6c-2.3 3.4-2.3 9.4 0 12.8" />
    </svg>
  );
}

function IconLotus({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 4 Q15 9 12 14.5 Q9 9 12 4Z" />
      <path d="M6.8 6.6 Q10.8 10 11.8 14.2 Q7.8 13.2 6.8 6.6Z" />
      <path d="M17.2 6.6 Q13.2 10 12.2 14.2 Q16.2 13.2 17.2 6.6Z" />
      <path d="M5 19h14" />
    </svg>
  );
}

function IconGrid({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ArrowIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

const categories = [
  {
    name: 'Electronics',
    href: '/products?category=Electronics',
    count: { value: 2400, suffix: '+' },
    description: 'Latest gadgets, smart devices and electronics for a smarter you.',
    tint: 'bg-[#DCECF7]',
    stroke: 'text-[#5F8FB0]',
    icon: IconLaptop,
    isCta: false,
  },
  {
    name: 'Clothing & Apparel',
    href: '/products?category=Clothing%20%26%20Apparel',
    count: { value: 1800, suffix: '+' },
    description: 'Premium fashion, apparel and everyday essentials for every wardrobe.',
    tint: 'bg-[#F6E0E2]',
    stroke: 'text-[#B07E84]',
    icon: IconShirt,
    isCta: false,
  },
  {
    name: 'Home & Furniture',
    href: '/products?category=Home%20%26%20Furniture',
    count: { value: 1200, suffix: '+' },
    description: 'Stylish furniture, décor and home upgrades for every living space.',
    tint: 'bg-[#E1EAD9]',
    stroke: 'text-[#7E9B6F]',
    icon: IconSofa,
    isCta: false,
  },
  {
    name: 'Sports Equipment',
    href: '/products?category=Sports%20Equipment',
    count: { value: 850, suffix: '+' },
    description: 'High-performance gear, fitness tools and athletic essentials.',
    tint: 'bg-[#F3E7C9]',
    stroke: 'text-[#B39354]',
    icon: IconBasketball,
    isCta: false,
  },
  {
    name: 'Health & Beauty',
    href: '/products?category=Health%20%26%20Beauty',
    count: { value: 950, suffix: '+' },
    description: 'Skincare, wellness and beauty products that care for you.',
    tint: 'bg-[#EAE0F3]',
    stroke: 'text-[#9380B0]',
    icon: IconLotus,
    isCta: false,
  },
  {
    name: 'View All Categories',
    href: '/products',
    count: null,
    description: 'Explore everything we have to offer in one place.',
    tint: '',
    stroke: '',
    icon: IconGrid,
    isCta: true,
  },
];

function useCountUp(target, duration = 900) {
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

function CategoryCard({ cat, index }) {
  const Icon = cat.icon;
  const [display, countRef] = useCountUp(cat.count ? cat.count.value : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link
        href={cat.href}
        className={`group relative flex flex-col h-full rounded-[4px] border overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
          cat.isCta
            ? 'bg-[#3B2A1C] border-[#3B2A1C] shadow-[0_2px_12px_rgba(42,35,24,0.1)] hover:shadow-[0_18px_36px_-10px_rgba(42,35,24,0.35)]'
            : 'bg-[#FBF8F0] border-[rgba(185,138,60,0.16)] shadow-[0_2px_12px_rgba(42,35,24,0.06)] hover:shadow-[0_18px_36px_-10px_rgba(42,35,24,0.16)]'
        }`}
      >
        <span className="absolute top-0 left-0 right-0 h-[2px] bg-[#B98A3C] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out pointer-events-none" />

        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <div
            className={`w-[58px] h-[58px] rounded-full flex items-center justify-center transition-colors duration-300 ${
              cat.isCta
                ? 'bg-[#FBF8F0]/10 border border-[#FBF8F0]/20 group-hover:bg-[#B98A3C]'
                : `${cat.tint} group-hover:bg-[#B98A3C]`
            }`}
          >
            <Icon
              className={`w-7 h-7 transition-colors duration-300 ${
                cat.isCta ? 'text-[#FBF8F0]' : `${cat.stroke} group-hover:text-[#FBF8F0]`
              }`}
            />
          </div>

          <h3 className={`mt-5 font-fraunces font-semibold text-[20px] leading-tight ${cat.isCta ? 'text-[#FBF8F0]' : 'text-[#2A2318]'}`}>
            {cat.name}
          </h3>
          <span className={`mt-2 block h-[2px] w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out ${cat.isCta ? 'bg-[#B98A3C]' : 'bg-[#B98A3C]'}`} />

          {cat.count && (
            <p className="mt-2 text-sm text-[#5C5344]">
              <span ref={countRef}>{display.toLocaleString()}</span>
              {cat.count.suffix} products
            </p>
          )}

          <p className={`mt-3 text-sm leading-relaxed line-clamp-2 ${cat.isCta ? 'text-[#FBF8F0]/70' : 'text-[#5C5344]'}`}>
            {cat.description}
          </p>

          <span
            className={`mt-auto pt-6 w-fit inline-flex items-center gap-2 border px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
              cat.isCta
                ? 'border-[#FBF8F0]/40 text-[#FBF8F0] group-hover:border-[#B98A3C] group-hover:bg-[#B98A3C]/20'
                : 'border-[rgba(185,138,60,0.4)] text-[#2A2318] group-hover:border-[#B98A3C]'
            }`}
          >
            Browse Now
            <ArrowIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoryGrid() {
  const { ref } = useScrollReveal({ threshold: 0.05 });

  return (
    <section ref={ref} className="py-16 sm:py-24 font-jost bg-[#F3EDDF] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <AnimatedSection animation="fade-up" className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-4">
            <span aria-hidden className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#D8BC85]" />
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-[#93692A]">
              Browse by Category
            </span>
            <span aria-hidden className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#D8BC85]" />
          </div>
          <h2 className="mt-4 font-fraunces font-semibold text-[32px] sm:text-[40px] lg:text-[44px] leading-tight tracking-[-0.02em] text-[#2A2318]">
            Explore Our Product{' '}
            <span className="italic text-[#B98A3C] font-medium">Categories</span>
          </h2>
          <p className="text-[#5C5344] text-base sm:text-lg font-normal leading-relaxed mt-3">
            Find exactly what you need from our wide range of products
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((cat, i) => (
            <CategoryCard key={cat.name} cat={cat} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
          {categories.slice(4).map((cat, i) => (
            <CategoryCard key={cat.name} cat={cat} index={i + 4} />
          ))}
        </div>
      </div>
    </section>
  );
}