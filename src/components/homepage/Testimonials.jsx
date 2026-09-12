'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Ahmed Raza',
    designation: 'CEO, Retail Electronics Store — Lahore',
    rating: 5,
    quote: 'Core Collective transformed how I source products. The verified suppliers and competitive wholesale pricing have doubled my profit margins.',
  },
  {
    name: 'Fatima Khan',
    designation: 'Owner, Fashion Boutique — Karachi',
    rating: 5,
    quote: 'I found the best clothing suppliers here. The quality checks and fast shipping have made my boutique the go-to fashion destination in Karachi.',
  },
  {
    name: 'Usman Ali',
    designation: 'Director, Home Goods Distributor — Islamabad',
    rating: 5,
    quote: 'The bulk pricing and dedicated B2B support are unmatched. We now source 80% of our inventory through Core Collective.',
  },
  {
    name: 'Sana Tariq',
    designation: 'Founder, SportsZone Retail — Sialkot',
    rating: 4,
    quote: 'Excellent platform for finding verified sports equipment suppliers. The MOQ options work perfectly for my business size.',
  },
  {
    name: 'Bilal Hussain',
    designation: 'Owner, ShopEasy Online — Rawalpindi',
    rating: 5,
    quote: 'As an online seller, finding reliable suppliers was always a challenge. Core Collective solved that with their verification system.',
  },
  {
    name: 'Zara Malik',
    designation: 'Importer, Luxe Beauty Co. — Lahore',
    rating: 5,
    quote: 'The supplier network is incredible. I found premium beauty brands at wholesale prices that my customers absolutely love.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function Testimonials() {
  return (
    <section className="relative isolate overflow-hidden py-20 sm:py-28 bg-[linear-gradient(160deg,#211A15_0%,#2B221B_100%)]">
      <div className="noise-bg absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(1100px 560px at 82% 0%, rgba(233,199,102,0.09), transparent 60%), radial-gradient(900px 520px at 0% 100%, rgba(0,0,0,0.35), transparent 60%)',
        }}
      />
      <div className="relative max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 sm:mb-18">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F1E7D3] mb-3">
            What Our Buyers Say
          </h2>
          <p className="text-[rgba(241,231,211,0.55)] text-base sm:text-lg max-w-2xl mx-auto">
            Real feedback from business owners who trust Core Collective for their sourcing needs.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={cardVariants} className="h-full">
              <div className="flex h-full flex-col bg-white/[0.04] border border-[#E9C766]/20 backdrop-blur-sm rounded-xl p-6 sm:p-7 transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.07] hover:border-[#E9C766]/50 hover:shadow-[0_24px_50px_-18px_rgba(0,0,0,0.65),0_0_42px_-8px_rgba(233,199,102,0.28)]">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={16}
                      className={j < t.rating ? 'text-[#E9C766] fill-current' : 'text-white/15'}
                    />
                  ))}
                </div>

                <div className="relative mb-4">
                  <Quote
                    size={28}
                    className="text-[#E9C766]/40 absolute -top-1 -left-1"
                  />
                  <p className="text-[#D6CBB4] text-sm leading-relaxed pl-7">
                    {t.quote}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E9C766]/10 mt-auto">
                  <p className="text-[#F1E7D3] font-semibold text-sm">{t.name}</p>
                  <p className="text-[rgba(241,231,211,0.5)] text-xs mt-0.5">{t.designation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}