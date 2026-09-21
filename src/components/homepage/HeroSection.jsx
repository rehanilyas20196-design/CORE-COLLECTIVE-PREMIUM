'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Store, ArrowRight, Star, Users, Package } from 'lucide-react';

const avatars = [
  'https://i.pravatar.cc/100?img=1',
  'https://i.pravatar.cc/100?img=2',
  'https://i.pravatar.cc/100?img=3',
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function HeroSection() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#F5F1EA] pt-32 sm:pt-36 pb-28 sm:pb-36">
      {/* Warm peachy/tan circle — top-left */}
      <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full bg-[#E2B98A]/25 blur-[130px] pointer-events-none" />
      {/* Soft gold circle — bottom-right */}
      <div className="absolute -bottom-48 -right-48 w-[650px] h-[650px] rounded-full bg-[#C9922E]/15 blur-[140px] pointer-events-none" />
      {/* Center warm glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-white/50 rounded-full blur-[120px] pointer-events-none" />

      {/* Elegant gold arc lines */}
      <svg
        className="absolute top-20 left-8 sm:left-14 w-40 h-40 sm:w-52 sm:h-52 opacity-[0.22] pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 190 C 10 80, 80 20, 190 10"
          stroke="#C9922E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M30 190 C 30 105, 85 55, 190 40"
          stroke="#C9922E"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
      <svg
        className="absolute bottom-24 right-8 sm:right-14 w-40 h-40 sm:w-52 sm:h-52 opacity-[0.22] pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M190 10 C 190 120, 120 180, 10 190"
          stroke="#C9922E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M190 40 C 175 125, 120 175, 30 190"
          stroke="#C9922E"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>

      {/* Faint dotted grid texture — top-right */}
      <div
        className="absolute top-16 right-10 sm:right-20 w-44 h-44 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(201,151,75,0.55) 1.2px, transparent 1.2px)',
          backgroundSize: '16px 16px',
        }}
      />

      <div className="relative max-w-[960px] mx-auto px-4 sm:px-6 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center"
        >
          {/* Eyebrow pill badge with flourishes */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-10 w-full">
            <span className="hidden sm:block w-16 lg:w-24 h-px bg-gradient-to-r from-transparent to-[#C9922E]/60" />
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-3 px-6 sm:px-7 py-2.5 sm:py-3 bg-white/90 backdrop-blur border border-amber-300/60 rounded-full shadow-sm shadow-amber-900/5"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-b from-[#F0D48F] to-[#D9A94E] flex items-center justify-center">
                <Store className="w-4 h-4 text-white" strokeWidth={2.2} />
              </span>
              <span className="text-[#9C6F1E] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">
                Pakistan&apos;s #1 B2B Marketplace
              </span>
            </motion.div>
            <span className="hidden sm:block w-16 lg:w-24 h-px bg-gradient-to-l from-transparent to-[#C9922E]/60" />
          </div>

          {/* Headline — mixed serif / sans, dominant */}
          <motion.h1
            variants={itemVariants}
            className="text-[2.9rem] sm:text-6xl lg:text-[4.9rem] font-bold leading-[1.06] tracking-[-0.02em] text-[#1C1814] [text-shadow:0_1px_2px_rgba(28,24,20,0.10),0_10px_40px_rgba(28,24,20,0.08)]"
          >
            Premium B2B Marketplace for{' '}
            <span className="font-playfair italic font-semibold bg-gradient-to-b from-[#F5E3AC] via-[#D9A94E] to-[#9C6F1E] bg-clip-text text-transparent [text-shadow:0_1px_2px_rgba(156,111,30,0.25)]">
              Verified Suppliers
            </span>
            {' '}& Buyers in Pakistan
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-[#6B665E] text-base sm:text-lg mt-9 leading-relaxed max-w-[600px]"
          >
            Connect with verified suppliers, source quality products at wholesale prices, and grow your business with Core Collective&apos;s trusted marketplace platform.
          </motion.p>

          {/* Pill search bar — larger */}
          <motion.div variants={itemVariants} className="mt-11 w-full" ref={searchRef}>
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 w-full max-w-[560px] mx-auto px-7 py-5 bg-white border border-[#E7E0D3] text-[#9A937F] hover:border-[#C9922E]/50 hover:text-[#6B665E] transition-all duration-300 group shadow-lg shadow-amber-900/5"
              >
                <Search className="w-6 h-6 text-[#C9922E]" />
                <span className="text-sm sm:text-base">Search products, categories, suppliers...</span>
                <span className="ml-auto inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-b from-[#EDC878] to-[#8F6318] text-white text-xs sm:text-sm font-semibold shadow-md shadow-amber-900/20 group-hover:brightness-105 transition-all">
                  Search
                </span>
              </button>
            ) : (
              <form onSubmit={handleSearch} className="w-full max-w-[560px] mx-auto">
                <div className="flex items-center gap-3 px-7 py-4.5 bg-white border border-[#C9922E] shadow-xl shadow-[#C9922E]/15">
                  <Search className="w-6 h-6 text-[#C9922E] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What are you looking for?"
                    className="flex-1 bg-transparent text-[#1C1814] text-sm sm:text-base outline-none placeholder:text-[#9A937F]"
                    autoFocus
                  />
                  <button type="submit" className="inline-flex items-center gap-1.5 px-6 py-3 bg-gradient-to-b from-[#EDC878] to-[#8F6318] text-white text-sm sm:text-base font-semibold shadow-md shadow-amber-900/20 hover:brightness-105 transition-all">
                    Search
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          {/* CTAs — larger, tactile */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5 mt-11"
          >
            <button
              onClick={() => router.push('/products')}
              className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-gradient-to-b from-[#F0D48F] via-[#D9A94E] to-[#A9781F] hover:via-[#E3B85E] active:scale-[0.97] text-white font-bold transition-all duration-300 shadow-[0_10px_30px_-8px_rgba(169,120,31,0.65)] hover:shadow-[0_14px_36px_-8px_rgba(169,120,31,0.75)] text-base sm:text-[1.05rem]"
            >
              <Package className="w-5 h-5" strokeWidth={2} />
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/supplier/signup')}
              className="inline-flex items-center justify-center gap-2.5 px-9 py-4 border-2 border-[#1C1814]/25 text-[#1C1814] hover:border-[#C9922E] hover:text-[#9C6F1E] hover:shadow-lg hover:shadow-amber-900/10 bg-white/40 backdrop-blur-sm font-bold transition-all duration-300 active:scale-[0.97] text-base sm:text-[1.05rem]"
            >
              <Store className="w-5 h-5" strokeWidth={2} />
              Become a Supplier
            </button>
          </motion.div>

          {/* Trust row — centered, divider above */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-4 mt-14 pt-7 border-t border-[#1C1814]/10 w-full max-w-[600px] mx-auto"
          >
            <div className="flex -space-x-2">
              {avatars.map((src, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-[#F5F1EA] ring-1 ring-[#E7E0D3] overflow-hidden"
                >
                  <img
                    src={src}
                    alt={`User ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C9922E] text-[#C9922E]" />
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[#6B665E] text-sm font-medium">
              <Users className="w-4 h-4 text-[#C9922E]" />
              Trusted by 10,000+ businesses
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}