'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag, ShieldCheck, TrendingUp, ShoppingCart } from 'lucide-react';

const categoryColors = {
  Electronics: 'bg-blue-100 text-blue-700',
  Clothing: 'bg-pink-100 text-pink-700',
  Furniture: 'bg-amber-100 text-amber-700',
  'Pet Supplies': 'bg-green-100 text-green-700',
  Tools: 'bg-orange-100 text-orange-700',
  Sports: 'bg-emerald-100 text-emerald-700',
  'Modern Tech': 'bg-amber-100 text-amber-700',
};

export default function ProductCard({ product, index = 0 }) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const p = product;
  const category = p.category || 'General';
  const priceDisplay = p.price_min || p.price;
  const priceMaxDisplay = p.price_max || p.price;
  const hasRange = priceDisplay !== priceMaxDisplay;
  const rating = p.rating || 0;
  const reviews = p.reviews_count || 0;
  const verified = p.is_verified || false;
  const featured = p.is_featured || false;
  const isNew = p.created_at && Date.now() - new Date(p.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/products/${p.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-[0_8px_32px_rgba(201,151,75,0.12)] group-hover:-translate-y-1.5 shadow-sm relative">
        <Link href={`/products/${p.id}`}>
          <div className="relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden bg-gray-50">
            {!imgError && p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingBag className="w-12 h-12" />
              </div>
            )}

            {featured && (
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-[10px] font-bold text-white shadow-lg">
                <TrendingUp className="w-3 h-3" /> Featured
              </div>
            )}

            {isNew && !featured && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-[10px] font-bold text-white shadow-lg">
                New
              </div>
            )}

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(!wishlisted); }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all duration-200"
            >
              <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>

            <div className="absolute bottom-3 left-3">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${categoryColors[category] || 'bg-gray-100 text-gray-500'}`}>
                {category}
              </span>
            </div>

            {verified && (
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-green-500/20 backdrop-blur-sm rounded-lg text-[10px] font-semibold text-green-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified
              </div>
            )}
          </div>
        </Link>

        <div className="p-4 space-y-2.5">
          <Link href={`/products/${p.id}`}>
            <p className="text-xs text-gray-400 truncate tracking-wide">{p.name.split(' ').slice(0, 4).join(' ')}{p.name.split(' ').length > 4 ? '...' : ''}</p>

            <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem] text-[15px]">
              {p.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-xs text-amber-500 font-semibold">{rating}</span>
            <span className="text-xs text-gray-400">({reviews})</span>
          </div>

          {p.moq && p.moq > 1 && (
            <div className="inline-flex items-center px-2.5 py-1 bg-gray-50 rounded-lg text-xs text-gray-400">
              MOQ: {p.moq} units
            </div>
          )}

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">
                PKR {Number(priceDisplay).toLocaleString()}
              </span>
              {hasRange && (
                <span className="text-sm text-gray-400">
                  - {Number(priceMaxDisplay).toLocaleString()}
                </span>
              )}
              <span className="text-xs text-gray-400">/ unit</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Bulk pricing available</p>
          </div>

          <motion.div
            initial={false}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10,
              height: isHovered ? 'auto' : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <button
              onClick={handleBuyNow}
              className="w-full py-2.5 bg-gradient-to-r from-primary to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-xl text-sm font-semibold text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Now
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
