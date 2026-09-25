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
    const timer = setInterval(() => setActiveStep((prev) => (prev + 1) % steps.length), 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 sm:py-24 font-jost bg-[#FAF9F6] border-t border-b border-gray-100 overflow-hidden">
      <style>{`
        @keyframes stepTravel {
          0% { left: 4%; opacity: 0; }
          12% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 94%; opacity: 0; }
        }
      `}</style>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gray-500">
            How It Works
          </span>
          <h2 className="mt-3 font-volkhov font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight text-black">
            How Core Collective Works
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-5">Three simple steps to source wholesale products</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-6 sm:gap-8 relative"
        >
          {steps.map((step, i) => {
            const isActive = activeStep === i;

            return (
              <motion.div key={step.number} className="relative" variants={itemVariants}>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-[76px] left-[55%] right-[-38%] h-[2px] rounded-full bg-gray-200">
                    <span
                      className={`absolute inset-y-0 left-0 w-full rounded-full bg-black origin-left transition-transform duration-[2800ms] ease-in-out ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />

                    {isActive && (
                      <span
                        className="absolute top-1/2 w-2 h-2 rounded-full bg-black shadow-[0_0_10px_2px_rgba(0,0,0,0.35)] -translate-y-1/2"
                        style={{ animation: 'stepTravel 2.5s ease-in-out infinite' }}
                      />
                    )}
                  </div>
                )}

                <div
                  className={`relative h-full bg-white border rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center transition-all duration-[600ms] ease-in-out hover:-translate-y-1 ${
                    isActive
                      ? 'border-black scale-[1.03] shadow-[0_24px_55px_-15px_rgba(0,0,0,0.3)]'
                      : 'border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
                  }`}
                >
                  <div
                    className={`w-[76px] h-[76px] rounded-2xl flex items-center justify-center mb-7 transition-all duration-[600ms] ease-in-out ${
                      isActive
                        ? 'bg-black shadow-[0_14px_30px_-8px_rgba(0,0,0,0.55)]'
                        : 'bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <svg
                      className={`w-8 h-8 transition-colors duration-[600ms] ${isActive ? 'text-white' : 'text-black'}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={step.svg} />
                    </svg>
                  </div>

                  <span
                    className={`inline-flex items-center justify-center min-w-[84px] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-[600ms] ${
                      isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    Step {step.number}
                  </span>

                  <h3 className="mt-4 font-volkhov font-bold text-xl sm:text-2xl text-black">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500 max-w-[300px]">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}