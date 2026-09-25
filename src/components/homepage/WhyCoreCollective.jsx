'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, BadgePercent, Lock, Truck, Headphones, BadgeCheck } from 'lucide-react';

const features = [
  {
    number: '01',
    icon: ShieldCheck,
    title: 'Verified Suppliers',
    desc: 'Every supplier is thoroughly vetted and verified for quality and reliability.',
  },
  {
    number: '02',
    icon: BadgePercent,
    title: 'Bulk Pricing',
    desc: 'Competitive wholesale prices with volume discounts for every order size.',
  },
  {
    number: '03',
    icon: Lock,
    title: 'Secure Payments',
    desc: 'Protected transactions with multiple payment options for peace of mind.',
  },
  {
    number: '04',
    icon: Truck,
    title: 'Fast Delivery',
    desc: 'Reliable shipping across Pakistan with express delivery options.',
  },
  {
    number: '05',
    icon: Headphones,
    title: 'Dedicated Support',
    desc: '24/7 customer support for all your needs, from sourcing to delivery.',
  },
  {
    number: '06',
    icon: BadgeCheck,
    title: 'Quality Assured',
    desc: 'Rigorous quality checks on all products to ensure you get the best.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function WhyCoreCollective() {
  return (
    <section className="relative py-16 sm:py-24 font-jost bg-white overflow-hidden">
      {/* Subtle neutral glow accents */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-gray-100 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full bg-gray-100 blur-[120px]" aria-hidden />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gray-500">
            Why Core Collective
          </span>
          <h2 className="mt-3 font-volkhov font-bold text-3xl sm:text-4xl lg:text-5xl text-black leading-tight">
            Trusted By Businesses Across Pakistan
          </h2>
          <p className="mt-5 text-gray-500 text-sm sm:text-base leading-relaxed">
            Everything you need to source and sell with confidence
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.number}
                variants={itemVariants}
                className="group relative bg-white rounded-2xl p-7 sm:p-8 overflow-hidden border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-1.5 hover:border-gray-300 hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.25)]"
              >
                {/* Top hairline on hover */}
                <span className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-black to-transparent scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-500 ease-out pointer-events-none" />

                {/* Decor corner number */}
                <span className="absolute top-6 right-6 font-volkhov italic font-semibold text-4xl leading-none text-gray-100 transition-colors duration-500 group-hover:text-gray-200 select-none pointer-events-none">
                  {feature.number}
                </span>

                {/* Icon tile */}
                <div className="relative w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center transition-all duration-500 group-hover:bg-black group-hover:border-black group-hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)] group-hover:-translate-y-0.5">
                  <Icon className="w-6 h-6 text-black transition-colors duration-500 group-hover:text-white" strokeWidth={1.8} />
                </div>

                <h3 className="mt-6 font-volkhov font-bold text-lg leading-snug text-black">
                  {feature.title}
                </h3>

                <span className="mt-3 block w-8 h-[2px] bg-gray-200 transition-all duration-500 group-hover:w-12 group-hover:bg-black" />

                <p className="mt-3 text-sm leading-relaxed text-gray-500">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}