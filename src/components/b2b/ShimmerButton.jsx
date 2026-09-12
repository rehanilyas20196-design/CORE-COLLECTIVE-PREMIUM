'use client';

import { ArrowRight } from 'lucide-react';

export default function ShimmerButton({
  href = '/supplier/signup',
  children = 'Become a Supplier',
  showArrow = true,
  className = '',
}) {
  return (
    <a
      href={href}
      className={`group relative inline-flex items-center gap-2 overflow-hidden bg-gradient-to-r from-[#A9762A] via-[#D9A648] to-[#C08A2E] px-8 py-4 text-[#FFFDF7] text-sm font-semibold tracking-wide shadow-[0_10px_30px_-8px_rgba(192,138,46,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-8px_rgba(192,138,46,0.7)] active:translate-y-0 ${className}`}
    >
      <span
        className="animate-cta-sheen absolute top-0 bottom-0 w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/50 to-transparent"
        aria-hidden="true"
      />
      {showArrow && (
        <ArrowRight className="w-4 h-4 -ml-1 translate-x-0 transition-transform duration-300 group-hover:translate-x-0.5" />
      )}
      <span className="relative">{children}</span>
    </a>
  );
}