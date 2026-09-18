'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import OptimizedProductImage from './OptimizedProductImage';

export function getProductImages(product, limit = 3) {
  const raw = product?.images;
  let arr = Array.isArray(raw)
    ? raw.filter(Boolean)
    : typeof raw === 'string'
      ? raw.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  arr = arr.slice(0, limit);
  if (arr.length === 0 && product?.image_url) arr = [product.image_url];
  return arr;
}

export default function ProductImageCarousel({
  product,
  iconSize = 'w-12 h-12',
  arrowSize = 'w-4 h-4',
  sizes = '(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw',
}) {
  const images = getProductImages(product);
  const [errored, setErrored] = useState({});
  const [active, setActive] = useState(0);

  const visible = images
    .map((src, i) => (errored[i] ? null : src))
    .filter(Boolean);

  const safeActive = visible.length ? Math.min(active, visible.length - 1) : 0;

  const handleError = (i) => {
    setErrored((prev) => ({ ...prev, [i]: true }));
  };

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const goPrev = (e) => {
    stop(e);
    if (visible.length > 1) setActive((a) => (a - 1 + visible.length) % visible.length);
  };

  const goNext = (e) => {
    stop(e);
    if (visible.length > 1) setActive((a) => (a + 1) % visible.length);
  };

  return (
    <div className="relative w-full h-full">
      {visible.length > 0 ? (
        <OptimizedProductImage
          src={visible[safeActive]}
          alt={product?.name || 'Product image'}
          sizes={sizes}
          classN="object-cover"
          onError={() => handleError(safeActive)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#B98A3C]/40">
          <ShoppingCart className={iconSize} />
        </div>
      )}

      {visible.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FBF8F0]/85 border border-[rgba(185,138,60,0.25)] text-[#3B2A1C] flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 hover:bg-[#FBF8F0]"
            aria-label="Previous image"
          >
            <ChevronLeft className={arrowSize} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FBF8F0]/85 border border-[rgba(185,138,60,0.25)] text-[#3B2A1C] flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 hover:bg-[#FBF8F0]"
            aria-label="Next image"
          >
            <ChevronRight className={arrowSize} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {visible.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { stop(e); setActive(i); }}
                aria-label={`Go to image ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  i === safeActive ? 'w-4 bg-[#B98A3C]' : 'bg-white/80 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}