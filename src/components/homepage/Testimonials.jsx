'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    name: 'James R.',
    role: 'Verified Buyer — Lahore',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    quote: 'Core Collective transformed how I source products. The verified suppliers and competitive wholesale pricing have doubled my profit margins.',
  },
  {
    name: 'Fatima K.',
    role: 'Verified Boutique Owner — Karachi',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    quote: 'I found the best clothing suppliers here. The quality checks and fast shipping have made my boutique the go-to fashion destination in Karachi.',
  },
  {
    name: 'Usman A.',
    role: 'Verified Distributor — Islamabad',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    rating: 5,
    quote: 'The bulk pricing and dedicated B2B support are unmatched. We now source 80% of our inventory through Core Collective.',
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const t = testimonials[activeIndex];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF9F6] border-t border-b border-gray-100 font-jost overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="font-volkhov font-bold text-3xl sm:text-4xl lg:text-5xl text-black">
            This Is What Our Customers Say
          </h2>
          <p className="mt-3 text-gray-500 text-sm sm:text-base leading-relaxed">
            Real feedback from business owners and wholesale buyers across Pakistan who rely on Core Collective.
          </p>
        </motion.div>

        {/* FASCO Elevated Center Testimonial Card */}
        <div className="max-w-3xl mx-auto relative px-4">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl p-8 sm:p-12 shadow-xl border border-gray-200 flex flex-col md:flex-row items-center gap-8 relative z-10"
          >
            {/* Avatar Photo */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-neutral-200 shadow-md">
              <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
            </div>

            {/* Testimonial Content */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
                ))}
              </div>

              <p className="text-gray-700 text-sm sm:text-base italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div>
                <h4 className="font-volkhov font-bold text-lg text-black">{t.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
              </div>
            </div>
          </motion.div>

          {/* Dots Navigation Controls */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="w-8 h-8 rounded-full border border-gray-300 bg-white text-black flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm mr-2"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeIndex === idx ? 'bg-black w-7' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}

            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
              className="w-8 h-8 rounded-full border border-gray-300 bg-white text-black flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm ml-2"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}