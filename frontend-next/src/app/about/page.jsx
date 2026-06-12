'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Globe, Shield, TrendingUp, Users, Award, Zap } from 'lucide-react';

const stats = [
  { label: 'Products Listed', value: '10,000+' },
  { label: 'Verified Suppliers', value: '500+' },
  { label: 'Countries Served', value: '30+' },
  { label: 'Years in Business', value: '5+' },
];

const values = [
  { icon: Shield, title: 'Trust & Transparency', desc: 'Every supplier is verified. Every transaction is tracked. We build trust through transparency.' },
  { icon: TrendingUp, title: 'Growth Focused', desc: 'We help businesses scale with competitive wholesale pricing and flexible order quantities.' },
  { icon: Globe, title: 'Global Reach', desc: 'Connect with suppliers and buyers across 30+ countries with seamless cross-border logistics.' },
  { icon: Users, title: 'Community First', desc: 'We\'re building more than a marketplace — we\'re building a community of businesses helping each other grow.' },
  { icon: Award, title: 'Quality Assured', desc: 'Rigorous supplier vetting and quality checks ensure you get what you pay for, every time.' },
  { icon: Zap, title: 'Fast & Efficient', desc: 'Streamlined ordering, instant quotes, and dedicated support to keep your business moving.' },
];

const team = [
  { name: 'Ahmed Khan', role: 'CEO & Founder', bio: '10+ years in B2B commerce and supply chain management.' },
  { name: 'Sara Ali', role: 'Head of Operations', bio: 'Expert in logistics and supplier relations across South Asia.' },
  { name: 'Usman Raza', role: 'CTO', bio: 'Full-stack engineer passionate about building scalable marketplaces.' },
  { name: 'Fatima Ahmed', role: 'Head of Partnerships', bio: 'Building strategic supplier relationships globally.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-16 sm:py-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-primary">About</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">About Core Collective</h1>
            <p className="text-gray-700 text-lg max-w-2xl">We connect verified suppliers with businesses worldwide to make wholesale sourcing simple, transparent, and efficient.</p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">Our Mission</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Empowering businesses with seamless wholesale sourcing</h2>
            <p className="text-gray-700 leading-relaxed">Core Collective was founded to solve the biggest challenges in B2B commerce — finding reliable suppliers, negotiating fair prices, and managing bulk orders across borders. We combine technology with deep industry expertise to create a marketplace where businesses can source with confidence.</p>
            <p className="text-gray-700 leading-relaxed mt-4">Whether you're a small retailer or a large distributor, our platform gives you access to vetted suppliers, competitive wholesale pricing, and the tools you need to grow your business.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">At a Glance</h3>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">Our Values</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">What we stand for</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 hover:border-primary/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">Our Team</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">The people behind Core Collective</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {team.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-100 transition-all">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{m.name.charAt(0)}</span>
                </div>
                <h3 className="font-bold text-gray-900">{m.name}</h3>
                <p className="text-xs text-primary font-medium mt-1">{m.role}</p>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{m.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-[#13131F] to-primary/5 border border-primary/20 rounded-3xl p-8 sm:p-12 text-center">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to grow your business?</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">Join thousands of businesses sourcing products on Core Collective.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/products" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">Browse Products</a>
              <a href="/supplier/signup" className="px-6 py-3 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all">Become a Supplier</a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
