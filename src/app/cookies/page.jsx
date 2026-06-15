'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const sections = [
  {
    title: 'What Are Cookies',
    content: 'Cookies are small text files stored on your device by your web browser. They help websites remember your preferences, login status, and other information to improve your browsing experience. Cookies can be "persistent" (remain after you close your browser) or "session" (deleted when you close your browser).',
  },
  {
    title: 'How We Use Cookies',
    content: 'Core Collective uses cookies for essential functionality (authentication, security), performance analytics (page views, load times), personalization (remembering preferences), and marketing (targeted advertising). We may also use third-party cookies from services like analytics providers and payment processors.',
  },
  {
    title: 'Types of Cookies We Use',
    content: 'Essential Cookies: Required for the platform to function, including authentication and security. Analytics Cookies: Help us understand how visitors use our site so we can improve. Preference Cookies: Remember your settings and preferences. Marketing Cookies: Used to deliver relevant advertisements and measure campaign effectiveness.',
  },
  {
    title: 'Third-Party Cookies',
    content: 'Some cookies are placed by third-party services we use, including Google Analytics for traffic analysis, payment processors for transaction security, and social media platforms for sharing features. These services have their own privacy and cookie policies governing their use of data.',
  },
  {
    title: 'Managing Cookies',
    content: 'You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies. However, please note that disabling essential cookies may affect the functionality of our platform, and some features may not work as intended.',
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. We encourage you to review this page periodically for the latest information on our cookie practices.',
  },
  {
    title: 'Contact Us',
    content: 'If you have any questions about our use of cookies, please contact us at ecommerce_corecollective@gmail.com or visit our Contact Us page.',
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-16 sm:py-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-primary">Cookie Policy</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Cookie Policy</h1>
            <p className="text-gray-700 text-lg max-w-2xl">Last updated: June 2026. Learn how we use cookies to improve your experience.</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
