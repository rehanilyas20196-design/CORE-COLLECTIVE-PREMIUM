'use client';

import {
  Laptop,
  Shirt,
  Home,
  Trophy,
  Wrench,
  Sparkles,
  UtensilsCrossed,
  Percent,
  ShieldCheck,
  Truck,
} from 'lucide-react';

const items = [
  { icon: Laptop, text: 'Electronics' },
  { icon: Shirt, text: 'Clothing' },
  { icon: Home, text: 'Home Goods' },
  { icon: Trophy, text: 'Sports Equipment' },
  { icon: Wrench, text: 'Industrial Tools' },
  { icon: Sparkles, text: 'Cosmetics' },
  { icon: UtensilsCrossed, text: 'Food & Beverage' },
  { icon: Percent, text: 'Wholesale Pricing' },
  { icon: ShieldCheck, text: 'Verified Suppliers' },
  { icon: Truck, text: 'Fast Shipping' },
];

export default function MarqueeStrip() {
  return (
    <div className="relative w-screen left-1/2 -ml-[50vw] flex-shrink-0 bg-gradient-to-r from-primary-400 via-primary to-primary-600 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] pointer-events-none" />
      <div className="flex whitespace-nowrap animate-marquee-scroll will-change-transform py-4 sm:py-5 border-y border-white/20">
        {/* Two identical copies for a seamless, gap-free loop */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center flex-shrink-0">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center">
                  <span className="inline-flex items-center gap-2.5 text-gray-950 text-xs sm:text-sm font-bold uppercase tracking-[0.18em] px-4 sm:px-6">
                    <Icon className="w-4 h-4 text-gray-950 stroke-[2.2] shrink-0" />
                    <span>{item.text}</span>
                  </span>
                  <span className="text-base sm:text-lg font-light text-gray-950/30 shrink-0 select-none">
                    +
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}