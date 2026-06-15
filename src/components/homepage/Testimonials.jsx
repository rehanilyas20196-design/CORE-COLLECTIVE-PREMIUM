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
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 sm:mb-18">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            What Our Buyers Say
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
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
            <motion.div
              key={i}
              variants={cardVariants}
              className="bg-white border border-gray-200 rounded-xl p-6 sm:p-7 shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className={j < t.rating ? 'text-star fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>

              <div className="relative mb-4">
                <Quote
                  size={28}
                  className="text-gold/30 absolute -top-1 -left-1"
                />
                <p className="text-gray-500 text-sm leading-relaxed pl-7">
                  {t.quote}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-gray-900 font-semibold text-sm">{t.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{t.designation}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
