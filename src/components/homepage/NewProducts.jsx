'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../context/CartContext';

const categoryBadges = {
  Electronics: 'bg-blue-100 text-blue-700',
  Clothing: 'bg-pink-100 text-pink-700',
  'Clothing & Apparel': 'bg-pink-100 text-pink-700',
  Furniture: 'bg-green-100 text-green-700',
  'Home & Furniture': 'bg-green-100 text-green-700',
  'Pet Supplies': 'bg-pink-100 text-pink-700',
  Tools: 'bg-orange-100 text-orange-700',
  Sports: 'bg-emerald-100 text-emerald-700',
  'Sports Equipment': 'bg-emerald-100 text-emerald-700',
  'Modern Tech': 'bg-blue-100 text-blue-700',
  'Health & Beauty': 'bg-rose-100 text-rose-700',
};

function SkeletonCard() {
  return (
    <div className="bg-[#FBF8F0] border border-[rgba(185,138,60,0.16)] rounded-[4px] overflow-hidden">
      <div className="aspect-[4/5] bg-[#eee4d0] skeleton-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-3/4 bg-[#eee4d0] rounded skeleton-shimmer" />
        <div className="h-3 w-1/3 bg-[#eee4d0] rounded skeleton-shimmer" />
        <div className="h-8 w-full bg-[#3B2A1C]/15 rounded-[4px] skeleton-shimmer" />
      </div>
    </div>
  );
}

function TrendingStyleCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const p = product;
  const category = p.category || 'General';
  const current = Number(p.price_min || p.price || 0);
  const priceMax = Number(p.price_max || 0);
  const was = priceMax > current ? priceMax : null;
  const rating = p.rating || 0;
  const reviews = p.reviews_count || 0;
  const description =
    p.description || `Bulk ${category.toLowerCase()} supply at wholesale rates.`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div className="group relative flex flex-col h-full bg-[#FBF8F0] border border-[rgba(185,138,60,0.16)] rounded-[4px] overflow-hidden shadow-[0_2px_12px_rgba(42,35,24,0.06)] transition-shadow duration-300 hover:shadow-[0_10px_28px_-8px_rgba(42,35,24,0.14)]">
        <Link href={`/products/${p.id}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#eee4d0]">
            {!imgError && p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#B98A3C]/40">
                <ShoppingCart className="w-10 h-10" />
              </div>
            )}

            <span
              className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                categoryBadges[category] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {category}
            </span>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(!wishlisted); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#FBF8F0]/90 border border-[rgba(185,138,60,0.25)] flex items-center justify-center transition-all duration-200 hover:scale-110"
              aria-label="Toggle wishlist"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors duration-200 ${
                  wishlisted ? 'fill-[#B98A3C] text-[#B98A3C]' : 'text-[#93692A]'
                }`}
              />
            </button>

            <div className="absolute inset-x-0 bottom-0 max-sm:translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#FBF8F0] border-t border-[rgba(185,138,60,0.16)] p-3">
              <h3 className="font-fraunces text-[13.5px] font-semibold text-[#2A2318] leading-snug line-clamp-1">
                {p.name}
              </h3>

              <p
                className="mt-1 text-[11px] leading-relaxed text-[#5C5344]"
                style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {description}
              </p>

              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= Math.round(rating)
                          ? 'fill-[#B98A3C] text-[#B98A3C]'
                          : 'text-[#B98A3C]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[#5C5344] ml-0.5">({reviews})</span>
              </div>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-[15px] font-semibold text-[#B98A3C]">
                  PKR {current.toLocaleString()}
                </span>
                {was && (
                  <span className="text-[11px] font-medium text-[#8C8271] line-through">
                    PKR {was.toLocaleString()}
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                className={`mt-2.5 w-full py-2 rounded-[4px] text-[12px] font-medium text-[#FBF8F0] flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-[0.98] ${
                  added ? 'bg-[#93692A]' : 'bg-[#3B2A1C] hover:bg-[#4E3826]'
                }`}
              >
                {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export default function NewProducts() {
  const { data: products = [], isLoading } = useProducts();

  const sorted = [...products].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  return (
    <section className="py-16 sm:py-24 bg-[#F3EDDF] font-jost overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#93692A] border border-[rgba(185,138,60,0.4)] bg-transparent">
            New & Featured
          </span>
          <h2 className="mt-5 font-fraunces font-semibold text-[32px] sm:text-[40px] lg:text-[44px] tracking-[-0.02em] leading-[1.12] text-[#2A2318]">
            This Week&rsquo;s{' '}
            <span className="italic text-[#B98A3C] font-medium">Featured</span> Products
          </h2>
          <p className="mt-4 text-[#5C5344] text-base sm:text-lg font-normal leading-relaxed">
            Freshly listed picks from our verified suppliers
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-[4px] bg-[#FBF8F0] border border-[rgba(185,138,60,0.16)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#B98A3C]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p className="text-[#5C5344] text-lg font-medium">No products available yet</p>
            <p className="text-[#8C8271] text-sm mt-1">Check back soon for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {sorted.slice(0, 6).map((product, i) => (
              <TrendingStyleCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-[rgba(185,138,60,0.4)] text-[#2A2318] font-medium rounded-full transition-all duration-300 group hover:border-[#B98A3C] hover:bg-[#B98A3C]/10"
          >
            View All Products
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}