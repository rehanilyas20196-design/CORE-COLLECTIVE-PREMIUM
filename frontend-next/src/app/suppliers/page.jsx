'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Store, DollarSign, BarChart3, Globe, Shield, HeadphonesIcon, ArrowRight, Users, Package, TrendingUp } from 'lucide-react';

const benefits = [
  { icon: Globe, title: 'Global Exposure', desc: 'Showcase your products to thousands of active buyers across 30+ countries.' },
  { icon: DollarSign, title: 'Fair Pricing', desc: 'Set your own prices and margins. No hidden fees, no commission surprises.' },
  { icon: BarChart3, title: 'Sales Analytics', desc: 'Track views, inquiries, and orders with real-time analytics dashboard.' },
  { icon: Shield, title: 'Verified Badge', desc: 'Stand out with a verified supplier badge that builds buyer trust.' },
  { icon: HeadphonesIcon, title: 'Dedicated Support', desc: 'Get priority support from our supplier success team.' },
  { icon: Store, title: 'Storefront', desc: 'Create a branded storefront to showcase your full product catalog.' },
];

const steps = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up as a supplier and complete your profile with business details.' },
  { num: '02', title: 'Get Verified', desc: 'Our team reviews your business documents and verifies your credentials.' },
  { num: '03', title: 'List Your Products', desc: 'Upload your catalog with pricing, MOQs, and product details.' },
  { num: '04', title: 'Start Selling', desc: 'Receive inquiries, negotiate deals, and fulfill orders.' },
];

const stats = [
  { icon: Store, value: '500+', label: 'Active Suppliers' },
  { icon: Package, value: '10,000+', label: 'Products Listed' },
  { icon: Users, value: '50,000+', label: 'Buyers' },
  { icon: TrendingUp, value: '95%', label: 'Satisfaction Rate' },
];

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-16 sm:py-20">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-primary">Suppliers</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Partner with Core Collective</h1>
            <p className="text-gray-700 text-lg max-w-2xl mb-6">Join 500+ verified suppliers reaching thousands of B2B buyers worldwide. Grow your wholesale business with our platform.</p>
            <a href="/supplier/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all">
              Become a Supplier <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-600 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">Why Join Us</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Benefits for suppliers</h2>
            <p className="text-gray-600 mt-2">Everything you need to grow your wholesale business in one platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">How It Works</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Get started in 4 simple steps</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 transition-all">
                <span className="text-3xl font-bold text-primary/30">{step.num}</span>
                <h3 className="font-bold text-gray-900 mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">Testimonials</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">What our suppliers say</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { quote: 'Core Collective helped us expand our reach to international buyers we could never access before.', name: 'Ali Hassan', role: 'CEO, TechGrow Industries' },
              { quote: 'The verification process was smooth, and we started receiving inquiries within a week of listing our products.', name: 'Sana Malik', role: 'Founder, StyleCraft Textiles' },
              { quote: 'The analytics dashboard gives us real insights into what buyers are looking for. Invaluable for planning production.', name: 'Imran Shah', role: 'Director, PackMart Solutions' },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6">
                <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Supplier FAQs</h2>
          <div className="space-y-3">
            {[
              { q: 'How long does verification take?', a: 'Most applications are reviewed within 48 hours. We\'ll notify you via email once your account is verified.' },
              { q: 'Are there any listing fees?', a: 'No. Creating an account and listing products is completely free. We only charge a small commission on completed orders.' },
              { q: 'How do I get paid?', a: 'Payments are processed through our secure platform. You can choose bank transfer or PayPal. Payouts are released once the buyer confirms delivery.' },
              { q: 'Can I set my own prices?', a: 'Absolutely. You have full control over your pricing, MOQs, and shipping terms. We provide market insights to help you stay competitive.' },
            ].map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-900">{faq.q}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-[#13131F] to-primary/5 border border-primary/20 rounded-3xl p-8 sm:p-12 text-center">
          <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to grow with us?</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">Join 500+ suppliers already selling on Core Collective. Start reaching B2B buyers today.</p>
            <a href="/supplier/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all">
              Become a Supplier <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
