'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="relative isolate max-w-[1040px] mx-auto flex flex-col md:flex-row rounded-3xl overflow-hidden bg-[#D9C7A0] shadow-[0_28px_70px_-28px_rgba(43,32,19,0.4)] rotate-[-0.6deg] transition-transform duration-500 hover:rotate-0">
            {/* Stub — torn-ticket left column (stacked on top on small screens) */}
            <div className="relative flex md:flex-col items-center justify-between md:justify-center gap-x-4 gap-y-2 md:gap-y-0 px-5 md:px-3 py-5 md:py-10 shrink-0 md:w-[230px] bg-[#C4AF80] border-b-2 md:border-b-0 md:border-r-2 border-dashed border-[#2B2013]/30">
              {/* Perforation notches: mobile = bottom edge, desktop = right edge */}
              <span aria-hidden="true" className="md:hidden absolute z-10 -bottom-5 left-6 w-10 h-10 rounded-full bg-white" />
              <span aria-hidden="true" className="md:hidden absolute z-10 -bottom-5 right-6 w-10 h-10 rounded-full bg-white" />
              <span aria-hidden="true" className="hidden md:block absolute z-10 top-6 left-[210px] w-10 h-10 rounded-full bg-white" />
              <span aria-hidden="true" className="hidden md:block absolute z-10 bottom-6 left-[210px] w-10 h-10 rounded-full bg-white" />

              <span className="w-7 h-7 shrink-0 rounded-full border-2 border-[#2B2013]/45 inline-flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2B2013]/70" />
              </span>

              <div className="flex md:block items-baseline gap-2">
                <p className="font-spacemono text-[9px] tracking-[0.22em] uppercase text-[#2B2013]/55">
                  Member Rate
                </p>
                <p className="font-fraunces font-semibold text-[34px] leading-none text-[#C6962F]">
                  −12%
                </p>
              </div>

              <p className="font-spacemono text-[8px] tracking-[0.14em] uppercase leading-relaxed text-[#2B2013]/50 text-right md:text-center md:max-w-[16ch] max-w-[15ch]">
                Avg. saved per subscriber order
              </p>
            </div>

            {/* Main kraft-paper panel */}
            <div className="relative flex-1 overflow-hidden bg-[linear-gradient(145deg,#D9C7A0_0%,#C4AF80_100%)] px-6 sm:px-10 py-8 sm:py-10">
              <div aria-hidden="true" className="noise-bg absolute inset-0 mix-blend-multiply opacity-30 pointer-events-none" />

              {/* Ink stamp */}
              <div
                aria-hidden="true"
                className="hidden md:block absolute top-[22px] right-[22px] w-[92px] h-[92px] rounded-full border-2 border-[#2B2013]/45 rotate-[9deg] flex items-center justify-center"
              >
                <div className="w-[80px] h-[80px] rounded-full border border-[#2B2013]/25 flex items-center justify-center px-1">
                  <p className="font-spacemono text-[8px] leading-[1.6] uppercase tracking-[0.06em] text-[#2B2013]/60 text-center">
                    Verified<br />Wholesale<br />Network
                  </p>
                </div>
              </div>

              <div className="relative z-10 max-w-[540px] font-worksans">
                <p className="flex items-center gap-2 font-spacemono text-[10px] tracking-[0.25em] uppercase text-[#2B2013]/60">
                  <span className="w-2 h-2 rounded-full bg-[#C6962F]" />
                  Price Alert Manifest
                </p>

                <h3 className="mt-3 font-fraunces italic text-[28px] sm:text-[34px] leading-[1.1] tracking-[-0.01em] text-[#2B2013]">
                  Know the moment a price moves.
                </h3>

                <p className="mt-3 text-[15px] leading-relaxed text-[#2B2013]/70">
                  One short digest when a wholesale price drops or a fresh verified supplier
                  lists stock in your categories.
                </p>

                <div className="mt-6 flex gap-8">
                  {[
                    ['15,200+', 'Subscribers'],
                    ['2,400', 'Suppliers tracked'],
                    ['Daily', 'Digest cadence'],
                  ].map(([num, label]) => (
                    <div key={label}>
                      <p className="font-spacemono text-lg font-medium text-[#2B2013]">{num}</p>
                      <p className="mt-1 font-spacemono text-[9px] tracking-[0.18em] uppercase text-[#2B2013]/55">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                  <div className="flex-1 border-b-2 border-[#2B2013]/35 focus-within:border-[#2B2013] pb-1">
                    <label
                      htmlFor="wholesale-email"
                      className="block font-spacemono text-[9px] tracking-[0.22em] uppercase text-[#2B2013]/50"
                    >
                      Work email
                    </label>
                    <input
                      id="wholesale-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full bg-transparent text-[#2B2013] placeholder:text-[#2B2013]/35 outline-none py-2 text-[15px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 shrink-0 px-6 py-3.5 bg-[#2B2013] text-[#F1E7D3] font-worksans text-sm font-semibold rounded-md hover:bg-[#3E2D16] active:scale-[0.98] transition-all duration-300"
                  >
                    {subscribed ? 'Subscribed!' : 'Subscribe'}
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {subscribed ? (
                  <p className="mt-3 font-spacemono text-[11px] text-[#2B2013]/70">
                    ✓ You&apos;re on the list. First alert arrives soon.
                  </p>
                ) : (
                  <p className="mt-3 font-spacemono text-[11px] tracking-[0.02em] text-[#2B2013]/45">
                    No spam. Unsubscribe anytime.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}