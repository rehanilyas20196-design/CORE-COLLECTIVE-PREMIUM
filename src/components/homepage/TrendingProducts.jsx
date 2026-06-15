'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../products/ProductCard';

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 overflow-hidden">
      <div className="aspect-[16/9] bg-gray-100 rounded-xl mb-4 skeleton-shimmer" />
      <div className="h-5 w-20 bg-gray-100 rounded skeleton-shimmer mb-2" />
      <div className="h-4 w-3/4 bg-gray-100 rounded skeleton-shimmer mb-2" />
      <div className="h-3 w-1/2 bg-gray-100 rounded skeleton-shimmer mb-3" />
      <div className="h-6 w-1/2 bg-gray-100 rounded skeleton-shimmer mb-3" />
      <div className="h-10 w-full bg-gray-100 rounded-xl skeleton-shimmer" />
    </div>
  );
}



function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getMixedProducts(products) {
  const categoryMap = {};
  products.forEach(p => {
    const cat = p.category || 'Uncategorized';
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(p);
  });

  const categories = Object.keys(categoryMap);
  const result = [];
  const perCategory = Math.max(1, Math.floor(8 / categories.length));

  categories.forEach(cat => {
    const picked = shuffleArray(categoryMap[cat]).slice(0, perCategory);
    result.push(...picked);
  });

  if (result.length < 8) {
    const remaining = shuffleArray(
      products.filter(p => !result.find(r => r.id === p.id))
    );
    result.push(...remaining.slice(0, 8 - result.length));
  }

  return shuffleArray(result).slice(0, 8);
}

export default function TrendingProducts() {
  const { data: products = [], isLoading } = useProducts();

  return (
    <section className="py-16 sm:py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Trending{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">
              Wholesale Products
            </span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Sourced from verified global suppliers
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p className="text-gray-400 text-lg font-medium">No products available yet</p>
            <p className="text-gray-300 text-sm mt-1">Check back soon for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {getMixedProducts(products).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.6 }}
          className="text-center mt-10"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 group"
          >
            View All Products
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
