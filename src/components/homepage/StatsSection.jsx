'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Store, Package, Users, MapPin } from 'lucide-react';

function useCountUp(target, suffix = '+', duration = 2) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let start = 0;
          const increment = Math.ceil(target / (duration * 60));
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function AnimatedStat({ value, label, icon: Icon }) {
  const num = parseInt(value.replace(/,/g, ''), 10);
  const suffix = value.replace(/[\d,]/g, '');
  const { count, ref } = useCountUp(num, suffix);

  return (
    <div ref={ref} className="relative text-center group">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-amber-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-500">
        <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
      </div>
      <div className="text-4xl sm:text-5xl font-bold font-['Space_Grotesk',monospace] mb-1 bg-gradient-to-br from-primary to-amber-600 bg-clip-text text-transparent">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
}

const stats = [
  { value: '10000', label: 'Trusted Suppliers', icon: Store },
  { value: '50000', label: 'Products Listed', icon: Package },
  { value: '25000', label: 'Happy Buyers', icon: Users },
  { value: '500', label: 'Cities Covered', icon: MapPin },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function StatsSection() {
  return (
    <section className="bg-white border-y border-gray-100 py-16 sm:py-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {stats.map((stat, index) => (
            <motion.div key={stat.label} className="relative" variants={itemVariants}>
              {index > 0 && (
                <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6">
                  <div className="w-px h-16 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
                </div>
              )}
              <AnimatedStat {...stat} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
