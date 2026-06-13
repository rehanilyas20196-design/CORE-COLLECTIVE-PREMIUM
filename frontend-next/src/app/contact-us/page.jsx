'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const faqs = [
  { q: 'How do I place a wholesale order?', a: 'Browse our products page, add items to your inquiry list, and submit a quote request. Our team will respond within 24 hours with pricing and availability.' },
  { q: 'What is the minimum order quantity?', a: 'MOQs vary by product and supplier. Each product page lists its specific MOQ. Most products have MOQs ranging from 10–200 units.' },
  { q: 'Do you offer international shipping?', a: 'Yes! We work with suppliers who ship globally. Shipping costs and timelines are provided during the quote process.' },
  { q: 'How can I become a supplier?', a: 'Visit our Suppliers page and click "Become a Supplier". Fill out the application form, and our team will review your application within 48 hours.' },
  { q: 'What payment methods are accepted?', a: 'We accept bank transfers, PayPal, and major credit cards. Payment terms can be negotiated for large volume orders.' },
  { q: 'Can I request samples before ordering?', a: 'Many suppliers offer sample orders. Use the quote request form on the product page to ask about sample availability and pricing.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (!form.message.trim()) errs.message = 'Message is required';
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([{
        name: form.name, email: form.email, phone: form.phone || null,
        subject: form.subject, message: form.message,
      }]);
      if (error) throw error;
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setErrors({ submit: 'Failed to send message. Please try again or email us directly.' });
    } finally {
      setSubmitting(false);
    }
  };

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
              <span className="text-primary">Contact</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Get in Touch</h1>
            <p className="text-gray-700 text-lg max-w-2xl">Have a question about bulk orders, partnerships, or need help? Our team is here to help.</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Info Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
              <ContactInfo icon={Mail} label="Email" value="ecommerce_corecollective@gmail.com" href="mailto:ecommerce_corecollective@gmail.com" />
              <ContactInfo icon={Phone} label="Phone" value="+92 345 5900229" href="tel:+923000000000" />
              <ContactInfo icon={MapPin} label="Address" value="Karachi, Pakistan" />
              <ContactInfo icon={Clock} label="Business Hours" value="Mon–Sat: 9:00 AM – 6:00 PM PKT" />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Follow Us</h3>
              <div className="flex gap-3">
                {['LinkedIn', 'Twitter', 'Facebook', 'Instagram'].map(sm => (
                  <a key={sm} href="#" className="px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600 hover:text-primary hover:border-primary/30 border border-gray-200 transition-all">{sm}</a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-700 transition-all">Send Another Message</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField label="Full Name" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} error={errors.name} placeholder="John Doe" />
                    <FormField label="Email Address" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} error={errors.email} placeholder="john@example.com" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField label="Phone (optional)" type="tel" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+92 345 5900229" />
                    <FormField label="Subject" value={form.subject} onChange={v => setForm(p => ({ ...p, subject: v }))} error={errors.subject} placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={5}
                      placeholder="Tell us about your inquiry..."
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary resize-none" />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>
                  {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2">
                    {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value, href }) {
  const Content = () => (
    <div className="flex items-start gap-3 group cursor-pointer">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
  if (href) return <a href={href}><Content /></a>;
  return <Content />;
}

function FormField({ label, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary" />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
