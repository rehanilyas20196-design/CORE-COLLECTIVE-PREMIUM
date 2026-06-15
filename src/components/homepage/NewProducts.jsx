'use client';

import Link from 'next/link';
import { useProducts } from '../../hooks/useProducts';
import { useScrollReveal, AnimatedSection } from '../../hooks/useScrollReveal';
import ProductCard from '../products/ProductCard';

export default function NewProducts() {
  const { data: products = [], isLoading } = useProducts();
  const { ref } = useScrollReveal({ threshold: 0.05 });

  const sorted = [...products].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <AnimatedSection animation="fade-up" className="flex items-center justify-between mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Featured{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">
                Products
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Top picks from our suppliers
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-2 text-primary hover:text-primary-500 text-sm font-semibold transition-colors group"
          >
            View All
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </Link>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="aspect-square bg-gray-100 rounded-xl skeleton-shimmer mb-3" />
                <div className="h-4 w-3/4 bg-gray-100 rounded skeleton-shimmer mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sorted.slice(0, 6).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        <div className="sm:hidden text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:border-primary hover:text-primary transition-all duration-300 text-sm"
          >
            View All Products &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
