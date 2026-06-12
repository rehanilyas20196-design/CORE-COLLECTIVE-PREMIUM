'use client';

import { motion } from 'framer-motion';

const features = [
  {
    number: '01',
    title: 'Verified Suppliers',
    desc: 'Every supplier is thoroughly vetted and verified for quality and reliability.',
  },
  {
    number: '02',
    title: 'Bulk Pricing',
    desc: 'Competitive wholesale prices with volume discounts for every order size.',
  },
  {
    number: '03',
    title: 'Secure Payments',
    desc: 'Protected transactions with multiple payment options for peace of mind.',
  },
  {
    number: '04',
    title: 'Fast Delivery',
    desc: 'Reliable shipping across Pakistan with express delivery options.',
  },
  {
    number: '05',
    title: 'Dedicated Support',
    desc: '24/7 customer support for all your needs, from sourcing to delivery.',
  },
  {
    number: '06',
    title: 'Quality Assured',
    desc: 'Rigorous quality checks on all products to ensure you get the best.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function WhyCoreCollective() {
  return (
    <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
      {/* Subtle grid-pattern background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative accent blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <span className="block w-10 h-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            Why Core Collective
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to source and sell with confidence
          </p>
        </div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.number}
              variants={itemVariants}
              className="group relative bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <span className="text-4xl sm:text-5xl font-bold text-amber-400/70 leading-none select-none group-hover:text-amber-500 transition-colors duration-300">
                  {feature.number}
                </span>
                <div className="pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
