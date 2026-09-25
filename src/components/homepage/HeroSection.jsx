'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';

const brandLogos = [
  { name: 'CHANEL', tag: 'Luxury Apparel' },
  { name: 'LOUIS VUITTON', tag: 'Fashion Goods' },
  { name: 'PRADA', tag: 'Haute Couture' },
  { name: 'Calvin Klein', tag: 'Essentials' },
  { name: 'DENIM & CO', tag: 'Textiles' },
  { name: 'SAMSUNG', tag: 'Tech Supplies' },
  { name: 'NIKE B2B', tag: 'Sportswear' },
];

const heroCards = [
  {
    id: 1,
    title: 'Autumn Collection',
    category: 'Fashion & Apparel',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    tag: 'Trending',
  },
  {
    id: 2,
    title: 'Ultimate Wholesale',
    category: 'Verified Global Suppliers',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    badge: '25% OFF BULK',
    featured: true,
  },
  {
    id: 3,
    title: 'Modern Essentials',
    category: 'Wholesale Electronics & Home',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
    tag: 'New Season',
  },
];

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
    <section className="relative min-h-screen bg-[#FAF9F6] pt-24 sm:pt-28 pb-16 overflow-hidden">
      {/* Background Subtle Luxury Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-gray-100 via-neutral-100/60 to-amber-50/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Top Hero Layout: 3 Columns Grid matching FASCO Image 1 */}
        <div className="grid lg:grid-cols-12 gap-6 items-center">
          {/* Left Vertical Image Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-3 hidden lg:block"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-200 shadow-md group">
              <img
                src={heroCards[0].image}
                alt={heroCards[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-gray-200">
                  {heroCards[0].tag}
                </span>
                <h3 className="font-volkhov text-xl font-bold mt-2">{heroCards[0].title}</h3>
                <p className="text-xs text-gray-300 mt-1">{heroCards[0].category}</p>
              </div>
            </div>
          </motion.div>

          {/* Center Main Headline & CTA Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-center text-center px-2 sm:px-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span className="text-xs uppercase tracking-[0.22em] font-semibold text-gray-800">
                Verified Suppliers, Wholesale Prices
              </span>
            </div>

            {/* FASCO Style Big Editorial Headline */}
            <h1 className="font-volkhov font-bold text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-black">
              ULTIMATE
              <span className="block font-serif font-light italic text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 stroke-text">
                SALE
              </span>
            </h1>

            <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-gray-500 mt-4">
              HOP INTO ACTION &bull; WHOLESALE REVOLUTION
            </p>

            {/* FASCO Primary Black Pill Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => router.push('/products')}
                className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-md font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase hover:bg-neutral-800 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                SHOP NOW
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push('/supplier/signup')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-black border border-black rounded-md font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-300 active:scale-[0.98]"
              >
                Become Supplier
              </button>
            </div>

            {/* Center Hero Mini Banner Image (Mobile & Tablet) */}
            <div className="mt-8 w-full max-w-md rounded-2xl overflow-hidden shadow-md lg:hidden">
              <img
                src={heroCards[1].image}
                alt="Wholesale Sale Banner"
                className="w-full h-48 sm:h-60 object-cover"
              />
            </div>

            {/* Search Pill Component */}
            <div className="mt-8 w-full max-w-lg" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search wholesale products & suppliers..."
                  className="w-full pl-6 pr-32 py-3.5 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-black outline-none focus:border-black focus:ring-2 focus:ring-black/10 shadow-sm transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-6 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-all"
                >
                  Search
                </button>
              </form>
            </div>
          </motion.div>

          {/* Right Vertical Image Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="lg:col-span-3 hidden lg:block"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-200 shadow-md group">
              <img
                src={heroCards[2].image}
                alt={heroCards[2].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-gray-200">
                  {heroCards[2].tag}
                </span>
                <h3 className="font-volkhov text-xl font-bold mt-2">{heroCards[2].title}</h3>
                <p className="text-xs text-gray-300 mt-1">{heroCards[2].category}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FASCO Brand Logos Marquee Strip - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16 sm:mt-20"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
          <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.3em] font-semibold text-gray-400 mb-6">
            Featured Partner Brands & Verified Suppliers
          </p>
        </div>
        <div className="bg-white border-t border-b border-gray-100 py-7 overflow-hidden">
          <div className="flex w-max animate-marquee-scroll items-center">
            {[...brandLogos, ...brandLogos].map((brand, idx) => (
              <span
                key={idx}
                className="font-volkhov font-bold text-lg sm:text-xl md:text-2xl tracking-[0.18em] text-gray-900 whitespace-nowrap mx-8 sm:mx-12 md:mx-16 cursor-default"
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}