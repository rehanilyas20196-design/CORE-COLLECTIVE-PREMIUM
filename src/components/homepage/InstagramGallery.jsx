'use client';

import { motion } from 'framer-motion';

const instaPhotos = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
];

export default function InstagramGallery() {
  return (
    <section className="py-16 sm:py-20 bg-white font-jost overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-black">
            Follow Us On Instagram
          </h2>
          <p className="mt-2 text-gray-500 text-xs sm:text-sm leading-relaxed">
            Stay updated with our latest wholesale arrivals, supplier spotlights, and fashion trends on @corecollective
          </p>
        </motion.div>

        {/* 7-Photo Horizontal Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {instaPhotos.map((url, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 group shadow-sm"
            >
              <img
                src={url}
                alt={`Instagram Fashion Showcase ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold tracking-widest uppercase">
                  @Core
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
