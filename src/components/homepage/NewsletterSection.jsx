'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF9F6] border-t border-gray-100 font-jost overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 items-center gap-8">
          {/* Left Stand-Up Model Photo (FASCO Style: Yellow Coat Model) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 hidden lg:block"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-200 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
                alt="FASCO Newsletter Model Left"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Center Subscription Form Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 flex flex-col items-center text-center px-4"
          >
            <h2 className="font-volkhov font-bold text-3xl sm:text-4xl lg:text-5xl text-black">
              Subscribe To Our Newsletter
            </h2>

            <p className="mt-4 text-gray-600 text-xs sm:text-sm max-w-md leading-relaxed">
              Receive weekly digests on price drops, verified supplier arrivals, and wholesale deals tailored to your business needs.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-6 py-4 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-black outline-none focus:border-black focus:ring-2 focus:ring-black/10 shadow-sm transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-10 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-md hover:bg-neutral-800 transition-all shadow-md active:scale-[0.98]"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>

            {subscribed && (
              <p className="mt-3 text-xs text-green-700 font-semibold">
                &check; Thank you for subscribing to Core Collective alerts!
              </p>
            )}
          </motion.div>

          {/* Right Stand-Up Model Photo (FASCO Style: Dark Blazer Model) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 hidden lg:block"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-200 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop"
                alt="FASCO Newsletter Model Right"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}