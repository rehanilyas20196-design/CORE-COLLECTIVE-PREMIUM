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
    <section className="relative pt-[70px] pb-[90px] font-jost bg-[#F3EDDF] overflow-hidden">
      <div className="pointer-events-none" aria-hidden>
        <div
          className="absolute top-0 right-0 w-[520px] h-[520px] -translate-y-1/3 translate-x-1/4"
          style={{ background: 'radial-gradient(circle, rgba(185,138,60,0.15) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[440px] h-[440px] translate-y-1/3 -translate-x-1/4"
          style={{ background: 'radial-gradient(circle, rgba(185,138,60,0.1) 0%, transparent 65%)' }}
        />
      </div>

      <div className="relative max-w-[1080px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="block w-[46px] h-[3px] rounded-full bg-gradient-to-r from-[#E9C97B] via-[#B98A3C] to-[#93692A] mx-auto mb-5" />
          <h2 className="font-fraunces font-bold text-[38px] leading-tight tracking-[-0.02em] text-[#221D14]">
            Why Core Collective
          </h2>
          <p className="mt-4 text-[#746A57] text-base max-w-[760px] mx-auto">
            Everything you need to source and sell with confidence
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.number}
              variants={itemVariants}
              className="group relative bg-[#FBF8F0] rounded-[14px] p-6 sm:p-8 overflow-hidden border border-[rgba(185,138,60,0.16)] shadow-[0_4px_20px_rgba(180,140,80,0.08),inset_0_1px_0_rgba(255,251,238,0.9)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#B98A3C]/45 hover:shadow-[0_18px_38px_-12px_rgba(180,140,80,0.28),inset_0_1px_0_rgba(255,251,238,1)]"
            >
              <span className="absolute top-0 left-0 h-[2.5px] w-full rounded-full bg-gradient-to-r from-[#E9C97B] via-[#B98A3C] to-[#93692A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-600 ease-out pointer-events-none" />

              <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#B98A3C]/60 rounded-br-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <span className="inline-block font-fraunces font-bold text-[40px] leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#E9C97B] to-[#93692A] select-none transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1 group-hover:scale-105">
                {feature.number}
              </span>

              <h3 className="mt-5 font-fraunces font-semibold text-[17px] leading-snug text-[#221D14]">
                {feature.title}
              </h3>
              <span className="mt-2 block h-[2px] w-full bg-gradient-to-r from-[#B98A3C] to-[#D8BC85] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />

              <p className="mt-3 text-[13.5px] leading-relaxed text-[#746A57]">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}