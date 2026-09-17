'use client';

import Image from 'next/image';

const SUPABASE_HOST = 'izqxsfuyibbzwdxdcmev.supabase.co';

function canOptimize(src) {
  if (typeof src !== 'string' || !src) return false;
  return src.startsWith(`https://${SUPABASE_HOST}/`);
}

export default function OptimizedProductImage({
  src,
  alt,
  sizes,
  quality = 100,
  classN,
  priority,
  ...rest
}) {
  if (canOptimize(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        className={classN}
        {...rest}
      />
    );
  }
  return <img src={src} alt={alt} className={classN} loading="lazy" {...rest} />;
}