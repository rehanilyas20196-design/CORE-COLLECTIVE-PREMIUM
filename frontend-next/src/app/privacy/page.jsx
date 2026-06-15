'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const sections = [
  {
    title: 'Information We Collect',
    content: 'We collect information you provide directly, such as your name, email address, phone number, shipping address, and payment details when you create an account, place an order, or contact us. We also automatically collect certain information about your device and usage, including IP address, browser type, pages visited, and cookies.',
  },
  {
    title: 'How We Use Your Information',
    content: 'We use your information to process orders, communicate with you about your account and transactions, improve our platform, send marketing communications (with your consent), prevent fraud, and comply with legal obligations. We do not sell your personal information to third parties.',
  },
  {
    title: 'Information Sharing',
    content: 'We may share your information with suppliers to fulfill orders, with payment processors to handle transactions, with service providers who assist our operations, and when required by law. All third parties are bound by confidentiality agreements and are prohibited from using your data for unrelated purposes.',
  },
  {
    title: 'Data Security',
    content: 'We implement industry-standard security measures including SSL encryption, secure data storage, and regular security audits to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    title: 'Your Rights',
    content: 'You have the right to access, correct, or delete your personal data at any time. You can update your profile information in your account settings or contact us to request data deletion. You may also opt out of marketing communications at any time by clicking the unsubscribe link in our emails.',
  },
  {
    title: 'Cookies',
    content: 'We use cookies and similar tracking technologies to enhance your experience, analyze usage, and support our marketing efforts. You can manage cookie preferences through your browser settings. For more details, please see our Cookie Policy.',
  },
  {
    title: 'Data Retention',
    content: 'We retain your personal information for as long as your account is active or as needed to provide services. We may retain certain data longer to comply with legal obligations, resolve disputes, and enforce agreements. When no longer needed, data is securely deleted or anonymized.',
  },
  {
    title: 'Third-Party Links',
    content: 'Our platform may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites. We encourage you to review their privacy policies before providing any personal information.',
  },
  {
    title: 'Children\'s Privacy',
    content: 'Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal data, we will take steps to delete it promptly.',
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Material changes will be communicated via email or a prominent notice on our platform.',
  },
  {
    title: 'Contact Us',
    content: 'If you have questions or concerns about this Privacy Policy or our data practices, please contact us at ecommerce_corecollective@gmail.com or through our Contact Us page.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-16 sm:py-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-primary">Privacy Policy</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Privacy Policy</h1>
            <p className="text-gray-700 text-lg max-w-2xl">Last updated: June 2026. We take your privacy seriously.</p>
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
