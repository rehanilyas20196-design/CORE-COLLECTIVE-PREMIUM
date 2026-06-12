'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Laptop, Shirt, Home, Dumbbell, Flower2, ArrowRight } from 'lucide-react';
import { useScrollReveal, AnimatedSection } from '../../hooks/useScrollReveal';

const categories = [
  { name: 'Electronics', icon: Laptop, count: '2,400+', color: 'from-blue-100 to-blue-50' },
  { name: 'Clothing & Apparel', icon: Shirt, count: '1,800+', color: 'from-pink-100 to-pink-50' },
  { name: 'Home & Furniture', icon: Home, count: '1,200+', color: 'from-amber-100 to-amber-50' },
  { name: 'Sports Equipment', icon: Dumbbell, count: '850+', color: 'from-emerald-100 to-emerald-50' },
  { name: 'Health & Beauty', icon: Flower2, count: '950+', color: 'from-rose-100 to-rose-50' },
];

export default function CategoryGrid() {
  const { ref } = useScrollReveal({ threshold: 0.05 });

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative">
        <AnimatedSection animation="fade-up" className="text-center mb-10 sm:mb-14">
          <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">Categories</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 mb-3">
            Browse by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Category</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">Explore thousands of products across diverse categories</p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="block bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 text-center group cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-lg hover:border-primary/30 overflow-hidden relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-50 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    <cat.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{cat.name}</h3>
                  {cat.count && <p className="text-gray-600 text-xs">{cat.count} products</p>}
                </div>
              </Link>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.36, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/products"
              className="block bg-white border border-primary/20 rounded-2xl p-5 sm:p-6 text-center group cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-lg hover:bg-primary/5 overflow-hidden relative"
            >
              <div className="relative">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-primary mb-1">View All Categories</h3>
                <span className="inline-block mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Browse &rarr;</span>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
