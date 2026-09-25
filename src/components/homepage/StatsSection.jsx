'use client';

import { motion } from 'framer-motion';
import { Award, ShieldCheck, Truck, Headphones } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'High Quality',
    desc: 'Crafted from top materials & verified suppliers',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty Protection',
    desc: 'Over 2 years verified supplier coverage',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    desc: 'Order over $150 or bulk PKR 50,000+',
  },
  {
    icon: Headphones,
    title: '24 / 7 Support',
    desc: 'Dedicated B2B account assistance',
  },
];

export default function StatsSection() {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-b border-gray-100 font-jost">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-black group-hover:text-white text-black flex items-center justify-center shrink-0 transition-colors duration-300">
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="font-volkhov font-bold text-base text-black">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-normal">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}