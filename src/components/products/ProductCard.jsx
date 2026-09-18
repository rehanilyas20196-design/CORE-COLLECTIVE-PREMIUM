'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart, Check, TrendingUp, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ProductImageCarousel from './ProductImageCarousel';

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

function Badge({ featured, isNew }) {
  if (featured) {
    return (
      <div className="absolute top-[52px] left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white shadow-lg">
        <TrendingUp className="w-3 h-3" /> Featured
      </div>
    );
  }
  if (isNew) {
    return (
      <div className="absolute top-[52px] left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-[10px] font-bold text-white shadow-lg">
        New
      </div>
    );
  }
  return null;
}

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
  const rating = p.rating || 0;
  const reviews = p.reviews_count || 0;
  const verified = p.is_verified || false;
  const featured = p.is_featured || false;
  const isNew = p.created_at && Date.now() - new Date(p.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;
  const description = p.description || `Bulk ${category.toLowerCase()} supply at wholesale rates.`;
  const moq = p.moq;
  const url = `/products/${p.id}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const cardShell = `bg-[#FBF8F0] border border-[rgba(185,138,60,0.16)] rounded-[4px] overflow-hidden shadow-[0_2px_12px_rgba(42,35,24,0.06)] transition-shadow duration-300 hover:shadow-[0_10px_28px_-8px_rgba(42,35,24,0.14)]`;

  const firstThreeWords = p.name.split(' ').slice(0, 3).join(' ');

  const gridCard = (
    <div className={`group relative flex flex-col h-full ${cardShell}`}>
      <Link href={url} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#eee4d0]">
          <ProductImageCarousel product={p} priority={eager} />

          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-medium ${
              categoryBadges[category] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {category}
          </span>

          <Badge featured={featured} isNew={isNew} />

          {verified && (
            <div className="absolute top-[52px] right-3 px-2 py-0.5 rounded-full bg-white/90 border border-[rgba(185,138,60,0.25)] text-[10px] font-semibold text-[#93692A] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </div>
          )}

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(!wishlisted); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FBF8F0]/90 border border-[rgba(185,138,60,0.25)] flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Toggle wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-200 ${
                wishlisted ? 'fill-[#B98A3C] text-[#B98A3C]' : 'text-[#93692A]'
              }`}
            />
          </button>

          <div className="absolute inset-x-0 bottom-0 max-sm:translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#FBF8F0] border-t border-[rgba(185,138,60,0.16)] p-4">
            <h3 className="font-fraunces text-[16px] font-semibold text-[#2A2318] leading-snug line-clamp-1">
              {p.name}
            </h3>

            <p
              className="mt-1.5 text-[12px] leading-relaxed text-[#5C5344]"
              style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {description}
            </p>

            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(rating)
                        ? 'fill-[#B98A3C] text-[#B98A3C]'
                        : 'text-[#B98A3C]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-[#5C5344] ml-0.5">({reviews})</span>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-[18px] font-semibold text-[#B98A3C]">
                $${current.toFixed(2)}
              </span>
              {was && (
                <span className="text-[13px] font-medium text-[#8C8271] line-through">
                  $${was.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className={`mt-3 w-full py-2.5 rounded-[4px] text-[13px] font-medium text-[#FBF8F0] flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${
                added ? 'bg-[#93692A]' : 'bg-[#3B2A1C] hover:bg-[#4E3826]'
              }`}
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              {added ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );

  const listCard = (
    <div className={`group flex flex-col sm:flex-row h-full ${cardShell}`}>
      <Link href={url} className="block sm:w-48 lg:w-56 shrink-0">
        <div className="relative aspect-[3/4] sm:h-full bg-[#eee4d0] overflow-hidden">
          <ProductImageCarousel product={p} priority={eager} />

          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-medium ${
              categoryBadges[category] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {category}
          </span>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(!wishlisted); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FBF8F0]/90 border border-[rgba(185,138,60,0.25)] flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Toggle wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-200 ${
                wishlisted ? 'fill-[#B98A3C] text-[#B98A3C]' : 'text-[#93692A]'
              }`}
            />
          </button>

          <Badge featured={featured} isNew={isNew} />
        </div>
      </Link>

      <div className="flex-1 p-5 flex flex-col items-start justify-center">
        <Link href={url}>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#93692A] font-medium">
            {firstThreeWords}
          </p>
          <h3 className="mt-1 font-fraunces text-[18px] font-semibold text-[#2A2318] leading-snug line-clamp-1">
            {p.name}
          </h3>
        </Link>

        <p
          className="mt-2 text-[13px] leading-relaxed text-[#5C5344] max-w-2xl"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(rating)
                      ? 'fill-[#B98A3C] text-[#B98A3C]'
                      : 'text-[#B98A3C]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-[#5C5344] ml-0.5">({reviews})</span>
          </div>

          {moq && moq > 1 && (
            <span className="px-2.5 py-1 bg-[#eee4d0] border border-[rgba(185,138,60,0.16)] rounded-full text-[11px] font-medium text-[#5C5344]">
              MOQ: {moq} units
            </span>
          )}

          {verified && (
            <span className="px-2.5 py-1 bg-[#eee4d0] border border-[rgba(185,138,60,0.16)] rounded-full text-[11px] font-medium text-[#93692A] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 w-full">
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-semibold text-[#B98A3C]">
              $${current.toFixed(2)}
            </span>
            {was && (
              <span className="text-[13px] font-medium text-[#8C8271] line-through">
                $${was.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-6 py-2.5 rounded-[4px] text-[13px] font-medium text-[#FBF8F0] flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] ${
              added ? 'bg-[#93692A]' : 'bg-[#3B2A1C] hover:bg-[#4E3826]'
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      {variant === 'list' ? listCard : gridCard}
    </motion.div>
  );
}