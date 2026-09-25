'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../context/CartContext';
import ProductImageCarousel from '../products/ProductImageCarousel';

const fallbackCategories = [
  'Electronics',
  'Clothing & Apparel',
  'Home & Furniture',
  'Sports Equipment',
  'Health & Beauty',
];

export default function NewProducts() {
  const { data: products = [], isLoading } = useProducts();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('All');
  const [wishlisted, setWishlisted] = useState({});
  const [addedId, setAddedId] = useState(null);

  const realCategories = (() => {
    const counts = {};
    products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 6);
  })();

  const filterCategories = [
    'All',
    ...(realCategories.length > 0 ? realCategories : fallbackCategories),
    'Discount Deals',
  ];

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1600);
  };

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Discount Deals') return Boolean(p.price_max && p.price_max > (p.price_min || p.price));
    return p.category === activeTab;
  });

  const displayList = (filteredProducts.length > 0 ? filteredProducts : products).slice(0, 6);

  return (
    <section className="py-16 sm:py-24 bg-white font-jost overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <h2 className="font-volkhov font-bold text-3xl sm:text-4xl lg:text-5xl text-black">
            New Arrivals
          </h2>
          <p className="mt-3 text-gray-500 text-sm sm:text-base leading-relaxed">
            Discover the latest wholesale listings added this week from verified suppliers across all major categories.
          </p>
        </motion.div>

        {/* FASCO Category Filter Pill Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12"
        >
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 ${
                activeTab === cat
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* FASCO 6-Grid Product Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayList.map((product, idx) => {
              const current = Number(product.price_min || product.price || 0);
              const was = product.price_max ? Number(product.price_max) : null;
              const isFav = wishlisted[product.id];
              const isAdded = addedId === product.id;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="group"
                >
                  <Link href={`/products/${product.id}`} className="block">
                    {/* Image Card Container */}
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F4F4F6] p-4 flex items-center justify-center transition-all duration-300 group-hover:shadow-xl">
                      <ProductImageCarousel product={product} priority={idx < 3} />

                      {/* Wishlist Icon */}
                      <button
                        onClick={(e) => toggleWishlist(e, product.id)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white text-black shadow-md flex items-center justify-center transition-transform hover:scale-110 z-20"
                        aria-label="Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-black text-black' : 'text-gray-600'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Product Details Below */}
                    <div className="mt-4 px-1 flex flex-col space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-gray-500">
                          {product.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
                          ))}
                        </div>
                      </div>

                      <h3 className="font-volkhov font-bold text-lg text-black group-hover:text-gray-700 transition-colors line-clamp-1">
                        {product.name}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-1">
                        {product.description || 'High quality wholesale inventory'}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-lg text-black">
                            ${current.toFixed(2)}
                          </span>
                          {was && was > current && (
                            <span className="text-xs text-gray-400 line-through">
                              ${was.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider text-white transition-all ${
                            isAdded ? 'bg-green-700' : 'bg-black hover:bg-neutral-800'
                          }`}
                        >
                          {isAdded ? 'Added' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* FASCO View All Pill Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14"
        >
          <Link
            href="/products"
            className="inline-block px-10 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.25em] rounded-full hover:bg-neutral-800 transition-all shadow-md active:scale-[0.98]"
          >
            View All
          </Link>
        </motion.div>
      </div>
    </section>
  );
}