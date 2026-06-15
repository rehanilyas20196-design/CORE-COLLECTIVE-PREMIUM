'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    svg: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    title: 'Browse & Discover',
    description: 'Search 10,000+ wholesale products from verified suppliers across Pakistan and beyond.',
  },
  {
    number: '02',
    svg: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Request a Quote',
    description: 'Contact suppliers directly with your bulk order requirements and get competitive pricing.',
  },
  {
    number: '03',
    svg: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    title: 'Receive & Grow',
    description: 'Get fast delivery across Pakistan with white-glove B2B support for every order.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveStep((prev) => (prev + 1) % steps.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 mb-3">
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Core Collective</span> Works
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">Three simple steps to source wholesale products</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative"
        >
          {steps.map((step, i) => (
            <motion.div key={step.number} className="relative" variants={itemVariants}>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] right-[-40%] h-[2px] bg-gradient-to-r from-primary/30 to-primary/10">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-500 transition-all duration-1000"
                    style={{ width: activeStep > i ? '100%' : '0%' }} />
                </div>
              )}
              <div className={`bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-lg ${activeStep === i ? 'border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/20' : ''}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-500 ${activeStep === i ? 'bg-primary scale-110 shadow-lg shadow-primary/30' : 'bg-primary/10'}`}>
                  <svg className={`w-7 h-7 ${activeStep === i ? 'text-white' : 'text-primary'}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.svg} />
                  </svg>
                </div>
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full transition-all duration-500 ${activeStep === i ? 'bg-primary text-white scale-105' : 'bg-gray-100 text-gray-500'}`}>
                    Step {step.number}
                  </span>
                </div>
                <h3 className="text-gray-900 text-lg sm:text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
