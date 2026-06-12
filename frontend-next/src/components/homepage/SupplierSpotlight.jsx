'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const suppliers = [
  {
    name: 'TechHub Pakistan',
    location: 'Lahore, Pakistan',
    categories: ['Electronics', 'Mobile Accessories'],
    products: '340+',
    initials: 'TH',
    color: '#D4A853',
  },
  {
    name: 'FashionWorld Karachi',
    location: 'Karachi, Pakistan',
    categories: ['Clothing', 'Fashion'],
    products: '520+',
    initials: 'FW',
    color: '#10B981',
  },
  {
    name: 'HomeComfort Ltd',
    location: 'Islamabad, Pakistan',
    categories: ['Home Goods', 'Furniture'],
    products: '280+',
    initials: 'HC',
    color: '#F59E0B',
  },
  {
    name: 'Guangzhou Trade Co.',
    location: 'Guangzhou, China',
    categories: ['Electronics', 'Industrial'],
    products: '1,200+',
    initials: 'GT',
    color: '#EF4444',
  },
  {
    name: 'SportsPro Industries',
    location: 'Sialkot, Pakistan',
    categories: ['Sports Equipment', 'Leather'],
    products: '190+',
    initials: 'SP',
    color: '#3B82F6',
  },
  {
    name: 'BeautyHub Pakistan',
    location: 'Lahore, Pakistan',
    categories: ['Health & Beauty', 'Cosmetics'],
    products: '450+',
    initials: 'BH',
    color: '#EC4899',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function SupplierSpotlight() {
  const scrollRef = useRef(null);

  return (
    <section className="py-16 sm:py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">
              Verified Supplier
            </span>{' '}
            Network
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Every supplier is manually verified for quality and reliability
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar"
        >
          {suppliers.map((sup, i) => (
            <motion.div
              key={sup.name}
              variants={itemVariants}
              className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 min-w-[260px] sm:min-w-[280px] flex-shrink-0 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 transition-all duration-500 cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                  style={{ backgroundColor: sup.color }}
                >
                  {sup.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 font-semibold text-sm truncate">{sup.name}</h4>
                  <p className="text-gray-600 text-xs">{sup.location}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {sup.categories.map((cat) => (
                  <span key={cat} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                    {cat}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-600 text-xs">
                  <span className="text-gray-900 font-semibold">{sup.products}</span> products
                </span>
                <span className="flex items-center gap-1 text-success text-xs font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Verified
                </span>
              </div>

              <Link
                href="/suppliers"
                className="block w-full text-center mt-4 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 hover:border-primary hover:text-primary transition-all duration-300"
              >
                View Supplier
              </Link>
            </motion.div>
          ))}

          <motion.div
            variants={itemVariants}
            className="min-w-[260px] sm:min-w-[280px] flex-shrink-0 bg-white border-2 border-dashed border-star/30 rounded-2xl flex items-center justify-center p-6 hover:-translate-y-2 hover:shadow-lg transition-all duration-500 cursor-pointer group"
          >
            <Link href="/supplier/signup" className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-star/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg className="w-8 h-8 text-star" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <h4 className="text-gray-900 font-bold text-lg mb-2">Become a Verified Supplier</h4>
              <p className="text-gray-600 text-sm mb-4">Join our growing network</p>
              <span className="inline-flex items-center gap-2 text-star font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                Register Now &rarr;
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
