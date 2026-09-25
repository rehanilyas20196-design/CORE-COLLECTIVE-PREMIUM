'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const sections = [
  {
    title: 'Acceptance of Terms',
    content: 'By accessing or using Core Collective ("the Platform"), you agree to be bound by these Terms of Use. If you do not agree, please do not use our services. We reserve the right to update these terms at any time, and continued use constitutes acceptance of changes.',
  },
  {
    title: 'Account Registration',
    content: 'You must provide accurate, current, and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. Notify us immediately of any unauthorized use.',
  },
  {
    title: 'User Conduct',
    content: 'You agree not to use the Platform for any unlawful purpose or in violation of any applicable laws. Prohibited activities include, but are not limited to: impersonation, spam, data scraping, transmitting malware, interfering with platform operations, or violating others\' intellectual property rights.',
  },
  {
    title: 'Orders & Payments',
    content: 'All orders are subject to acceptance and availability. Prices, delivery times, and product descriptions are provided to the best of our ability but may change without notice. Payment terms are specified during checkout. We reserve the right to cancel any order for fraud or policy violation.',
  },
  {
    title: 'Supplier Responsibilities',
    content: 'Suppliers listing products on Core Collective represent and warrant that their products comply with all applicable laws and regulations, are accurately described, and can be delivered as promised. Suppliers must fulfill orders in a timely manner and maintain quality standards.',
  },
  {
    title: 'Intellectual Property',
    content: 'All content on the Platform — including text, graphics, logos, images, and software — is the property of Core Collective or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without express permission.',
  },
  {
    title: 'Limitation of Liability',
    content: 'Core Collective acts as an intermediary between buyers and suppliers. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Platform, transactions between users, or any content provided by third parties. Our total liability is limited to the amount you paid us in the preceding 12 months.',
  },
  {
    title: 'Dispute Resolution',
    content: 'Any disputes arising from these terms or your use of the Platform shall be governed by the laws of Pakistan. We encourage informal resolution first. If unresolved, disputes shall be settled through binding arbitration in Karachi, Pakistan.',
  },
  {
    title: 'Termination',
    content: 'We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our discretion. Upon termination, your right to use the Platform ceases immediately. Provisions regarding liability, intellectual property, and dispute resolution survive termination.',
  },
  {
    title: 'Contact',
    content: 'For questions about these Terms of Use, please contact us at ecommerce_corecollective@gmail.com or visit our Contact Us page.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-16 sm:py-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-primary">Terms of Use</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Terms of Use</h1>
            <p className="text-gray-700 text-lg max-w-2xl">Last updated: June 2026. Please read these terms carefully before using Core Collective.</p>
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
