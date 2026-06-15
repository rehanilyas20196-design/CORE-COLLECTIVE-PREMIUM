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
  Sparkle
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
    <div className="relative bg-gradient-to-r from-primary-400 via-primary to-primary-600 overflow-hidden -rotate-[1deg] scale-y-105 -my-1 shadow-md py-3.5 border-y border-white/20 select-none">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] pointer-events-none" />
      <div className="flex whitespace-nowrap animate-marquee-scroll">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="flex items-center gap-8 sm:gap-12 px-4 sm:px-6">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-8 sm:gap-12">
                  <span className="text-gray-950 text-xs sm:text-sm font-bold uppercase tracking-[0.18em] inline-flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-gray-950 stroke-[2.2]" />
                    <span>{item.text}</span>
                  </span>
                  <Sparkle className="w-3 h-3 text-gray-950/30 fill-gray-950/15 shrink-0" />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
