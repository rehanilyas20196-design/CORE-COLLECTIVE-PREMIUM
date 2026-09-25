'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Package } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import OptimizedProductImage from '../products/OptimizedProductImage';
import { getProductImages } from '../products/ProductImageCarousel';

function ProductVisual({ product, sizes, priority, className }) {
  const image = getProductImages(product, 1)[0];

  return (
    <div className={className}>
      {image ? (
        <OptimizedProductImage
          src={image}
          alt={product.name || 'Featured product'}
          sizes={sizes}
          priority={priority}
          className="object-contain drop-shadow-[0_20px_18px_rgba(15,23,42,0.18)] transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          <Package className="h-16 w-16 sm:h-20 sm:w-20" strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}

function ArrowControl({ featured = false }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border shadow-sm transition-all duration-300 group-hover:scale-110 ${
        featured
          ? 'h-14 w-14 border-white/20 bg-black/30 text-white backdrop-blur-sm sm:h-16 sm:w-16'
          : 'h-10 w-10 border-black bg-black text-white sm:h-11 sm:w-11'
      }`}
      aria-hidden="true"
    >
      <ArrowUpRight className={featured ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-4 w-4 sm:h-5 sm:w-5'} />
    </span>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="min-h-[500px] animate-pulse rounded-2xl bg-gray-100 sm:min-h-[560px] lg:min-h-[680px]" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:min-h-[680px]">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="min-h-[280px] animate-pulse rounded-2xl bg-gray-100 sm:min-h-[300px]"
          />
        ))}
      </div>
    </div>
  );
}

export default function TrendingProducts() {
  const { data: products = [], isLoading, isError } = useProducts();
  const featuredProducts = products.slice(0, 5);
  const [featuredProduct, ...smallProducts] = featuredProducts;

  return (
    <section
      className="overflow-hidden bg-white py-16 font-jost sm:py-24"
      aria-label="Featured products"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        {isLoading ? (
          <ProductGridSkeleton />
        ) : isError ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <p className="font-semibold text-black">Featured products are temporarily unavailable.</p>
            <Link href="/products" className="mt-4 inline-block text-sm font-bold text-black hover:underline">
              Browse all products
            </Link>
          </div>
        ) : !featuredProduct ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <Package className="mx-auto h-10 w-10 text-gray-400" strokeWidth={1.5} />
            <p className="mt-4 font-semibold text-black">No featured products yet.</p>
            <Link href="/products" className="mt-4 inline-block text-sm font-bold text-black hover:underline">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-[500px] sm:min-h-[560px] lg:min-h-[680px]"
            >
              <Link
                href={`/products/${featuredProduct.id}`}
                aria-label={`View ${featuredProduct.name || 'featured product'}`}
                className="group relative block h-full min-h-[500px] overflow-hidden rounded-2xl border border-black bg-black shadow-[0_2px_12px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_44px_-14px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:min-h-[560px] lg:min-h-[680px]"
              >
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.06] blur-2xl transition-transform duration-700 group-hover:scale-150" />
                <span className="absolute right-5 top-5 z-20 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm backdrop-blur sm:right-6 sm:top-6 sm:px-4 sm:py-1.5 sm:text-xs">
                  Sale
                </span>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <ProductVisual
                  product={featuredProduct}
                  sizes="(max-width: 1023px) 100vw, 40vw"
                  priority
                  className="absolute inset-x-[9%] bottom-[24%] top-[7%] z-10 sm:inset-x-[12%] sm:bottom-[22%] sm:top-[6%]"
                />

                <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-5 p-6 sm:p-8 lg:p-9">
                  <div className="min-w-0 max-w-[80%]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                      Get 25% Special Discount
                    </p>
                    <h3 className="mt-2 font-volkhov text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                      {featuredProduct.name || 'Featured Product'}
                    </h3>
                  </div>
                  <ArrowControl featured />
                </div>
              </Link>
            </motion.article>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:min-h-[680px] lg:grid-rows-2">
              {smallProducts.map((product, index) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full min-h-[280px] sm:min-h-[300px]"
                >
                  <Link
                    href={`/products/${product.id}`}
                    aria-label={`View ${product.name || 'featured product'}`}
                    className="group relative block h-full min-h-[280px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-14px_rgba(0,0,0,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:min-h-[300px]"
                  >
                    <ProductVisual
                      product={product}
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 30vw"
                      priority={index < 2}
                      className="absolute inset-x-0 bottom-[27%] top-0 z-10 bg-[#F4F4F6]"
                    />
                    <div className="absolute inset-x-0 bottom-0 z-20 flex min-h-[27%] items-end justify-between gap-3 border-t border-gray-100 bg-white p-5 sm:p-6">
                      <h3 className="min-w-0 font-volkhov text-xl font-bold leading-snug text-black">
                        {product.name || 'Featured Product'}
                      </h3>
                      <ArrowControl />
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
