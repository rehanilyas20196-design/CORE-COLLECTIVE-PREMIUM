'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';

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
          className="bg-gradient-to-br from-primary/5 to-white border border-primary/20 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-radial from-star/5 via-transparent to-transparent" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Get Wholesale{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-star to-yellow-400">
                Price Alerts
              </span>
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-8 max-w-lg mx-auto">
              Be first to know when new suppliers join or prices drop. Join 15,000+ buyers already
              subscribed.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-5 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder:text-gray-500 text-sm"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 active:scale-[0.98] text-sm"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
                <Send className="w-4 h-4" />
              </button>
            </form>

            {subscribed && (
              <p className="text-success text-sm mt-3 animate-fade-in">
                ✓ You&apos;ve been subscribed successfully!
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
