'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ProductImageCarousel from './ProductImageCarousel';

export default function ProductCard({ product, index = 0, variant = 'grid' }) {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const p = product;
  const eager = index < 4;
  const category = p.category || 'General';
  const current = Number(p.price_min || p.price || 0);
  const priceMax = Number(p.price_max || 0);
  const was = priceMax > current ? priceMax : null;
  const rating = p.rating || 5;
  const reviews = p.reviews_count || 12;
  const verified = p.is_verified || false;
  const url = `/products/${p.id}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
  };

  const gridCard = (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
      <Link href={url} className="block">
        {/* FASCO Studio Neutral Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F4F4F6] p-3 flex items-center justify-center">
          <ProductImageCarousel product={p} priority={eager} />

          {/* Category Badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/90 text-black shadow-sm backdrop-blur">
            {category}
          </span>

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-black shadow-md flex items-center justify-center transition-transform hover:scale-110 z-20"
            aria-label="Toggle wishlist"
          >
            <Heart
              className={`w-4 h-4 ${
                wishlisted ? 'fill-black text-black' : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* Info Block Below */}
        <div className="p-4 flex flex-col flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(rating)
                      ? 'fill-[#FFB800] text-[#FFB800]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-400">({reviews})</span>
          </div>

          <h3 className="font-volkhov text-base font-bold text-black line-clamp-1 group-hover:text-gray-700 transition-colors">
            {p.name}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-1">
            {p.description || `Bulk wholesale supply for ${category}`}
          </p>

          <div className="mt-auto pt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-black">
                ${current.toFixed(2)}
              </span>
              {was && (
                <span className="text-xs text-gray-400 line-through">
                  ${was.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider text-white transition-all ${
                added ? 'bg-green-700' : 'bg-black hover:bg-neutral-800'
              }`}
            >
              {added ? 'Added' : 'Add'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );

  const listCard = (
    <div className="group flex flex-col sm:flex-row h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
      <Link href={url} className="block sm:w-48 lg:w-56 shrink-0">
        <div className="relative aspect-[3/4] sm:h-full bg-[#F4F4F6] overflow-hidden p-3">
          <ProductImageCarousel product={p} priority={eager} />

          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/90 text-black shadow-sm">
            {category}
          </span>
        </div>
      </Link>

      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(rating)
                      ? 'fill-[#FFB800] text-[#FFB800]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({reviews} reviews)</span>
          </div>

          <Link href={url}>
            <h3 className="font-volkhov text-xl font-bold text-black group-hover:text-gray-700 transition-colors">
              {p.name}
            </h3>
          </Link>

          <p className="mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {p.description || `Bulk wholesale supply available for ${category}`}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-black">
              ${current.toFixed(2)}
            </span>
            {was && (
              <span className="text-sm text-gray-400 line-through">
                ${was.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-6 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2 transition-all ${
              added ? 'bg-green-700' : 'bg-black hover:bg-neutral-800'
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {added ? 'Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="h-full"
    >
      {variant === 'list' ? listCard : gridCard}
    </motion.div>
  );
}