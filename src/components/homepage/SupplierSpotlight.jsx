'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Check, Sparkles } from 'lucide-react';

export default function SupplierSpotlight() {
  const [selectedSize, setSelectedSize] = useState('M');
  const [added, setAdded] = useState(false);

  const tags = [
    { label: 'Fit Style', top: '25%', left: '20%' },
    { label: 'High Rise', top: '50%', left: '75%' },
    { label: 'Premium Cotton', top: '70%', left: '25%' },
    { label: 'Verified Quality', top: '85%', left: '60%' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FAF9F6] border-t border-b border-gray-100 font-jost overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-[#EFEBE4] rounded-3xl overflow-hidden shadow-xl border border-gray-200 grid lg:grid-cols-12 items-center">
          {/* Left Column: Interactive Product/Model Image with Hotspots */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-neutral-200 overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop"
              alt="Peaky Blinders Fashion Collection"
              className="w-full h-full object-cover"
            />

            {/* Interactive Tags matching FASCO Image 1 */}
            {tags.map((tag, idx) => (
              <div
                key={idx}
                className="absolute z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur rounded-md shadow-md text-[11px] font-semibold text-black hover:scale-105 transition-transform"
                style={{ top: tag.top, left: tag.left }}
              >
                <Tag className="w-3 h-3 text-black" />
                {tag.label}
              </div>
            ))}
          </motion.div>

          {/* Right Column: Peaky Blinders Product Specs & Buy Now */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-gray-200 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-800">
                Women&apos;s / Men&apos;s Collection
              </span>
            </div>

            <h2 className="font-volkhov font-bold text-3xl sm:text-5xl text-black leading-tight">
              Peaky Blinders
            </h2>

            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-lg">
              Explore our highest-grade luxury clothing line, crafted from 100% fine cotton and tailored for modern elegance. Direct wholesale ordering available for boutiques and retail chains across Pakistan.
            </p>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-bold text-gray-800 block">
                Size / MOQ Pack:
              </span>
              <div className="flex items-center gap-3">
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 rounded-md border text-xs font-bold transition-all ${
                      selectedSize === size
                        ? 'bg-black text-white border-black shadow'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-3xl font-bold text-black font-volkhov">
                $100.00
              </span>
              <span className="text-xs text-gray-500 block mt-1">
                Wholesale Unit Price (MOQ 10 pcs)
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => {
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1600);
                }}
                className={`w-full sm:w-auto px-10 py-4 rounded-md text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2 transition-all shadow-md ${
                  added ? 'bg-green-700' : 'bg-black hover:bg-neutral-800'
                }`}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                {added ? 'Added to Cart' : 'Buy Now'}
              </button>

              <Link
                href="/products"
                className="w-full sm:w-auto px-8 py-4 text-center border border-black text-black rounded-md text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
              >
                Explore More
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}