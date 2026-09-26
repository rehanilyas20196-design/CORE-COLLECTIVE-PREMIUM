'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Package } from 'lucide-react';
import { useScrollReveal, AnimatedSection } from '../../hooks/useScrollReveal';
import { api } from '../../lib/api';

const CATEGORY_IMAGES = {
  electronics: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop',
  'clothing & apparel': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
  'home & furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
  'sports equipment': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
  'health & beauty': 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop',
  'pet supplies': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
  tools: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=800&auto=format&fit=crop',
  'modern tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
  clothing: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
];

const FALLBACK_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Furniture',
  'Tools',
  'Sports',
  'Pet Supplies',
  'Modern Tech',
];

function imageForCategory(name, index = 0) {
  const key = (name || '').trim().toLowerCase();
  return CATEGORY_IMAGES[key] || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

const CATEGORY_DESCRIPTIONS = {
  electronics: 'Latest gadgets, smart devices and electronics for a smarter you.',
  clothing: 'Premium fashion, apparel and everyday essentials for every wardrobe.',
  furniture: 'Stylish furniture, décor and home upgrades for every living space.',
  'home & furniture': 'Stylish furniture, décor and home upgrades for every living space.',
  sports: 'High-performance gear, fitness tools and athletic essentials.',
  'sports equipment': 'High-performance gear, fitness tools and athletic essentials.',
  'health & beauty': 'Skincare, wellness and beauty products that care for you.',
  'pet supplies': 'Food, toys and care essentials for your furry friends.',
  tools: 'Durable hand and power tools for every job, big or small.',
  'modern tech': 'Cutting-edge tech and modern innovations for work and play.',
};

function descriptionForCategory(name) {
  const key = (name || '').trim().toLowerCase();
  return CATEGORY_DESCRIPTIONS[key] || `Browse our range of ${name}.`;
}

function formatCount(count) {
  return count.toLocaleString();
}

function CategoryImage({ category, className, priority = false }) {
  return (
    <div className={className}>
      {category.image ? (
        <img
          src={category.image}
          alt={category.name}
          loading={priority ? 'eager' : 'lazy'}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          <Package className="h-12 w-12" strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}

function ArrowControl({ featured = false }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border shadow-sm transition-all duration-300 group-hover:scale-110 ${
        featured
          ? 'h-14 w-14 border-white/20 bg-black/30 text-white backdrop-blur-sm sm:h-16 sm:w-16'
          : 'h-10 w-10 border-black bg-black text-white sm:h-11 sm:w-11'
      }`}
      aria-hidden="true"
    >
      <ArrowUpRight className={featured ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-4 w-4 sm:h-5 sm:w-5'} />
    </span>
  );
}

function CategoryCard({ category, index, featured = false }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={featured ? 'min-h-[500px] sm:min-h-[560px] lg:min-h-[680px]' : 'h-full min-h-[280px] sm:min-h-[300px]'}
    >
      <Link
        href={category.href}
        aria-label={`Explore ${category.name}`}
        className={`group relative block h-full overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black ${
          featured
            ? 'min-h-[500px] border border-black bg-black shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_24px_44px_-14px_rgba(0,0,0,0.45)] sm:min-h-[560px] lg:min-h-[680px]'
            : 'min-h-[280px] border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-14px_rgba(0,0,0,0.22)] sm:min-h-[300px]'
        }`}
      >
        {featured ? (
          <>
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.06] blur-2xl transition-transform duration-700 group-hover:scale-150" />
            <span className="absolute right-5 top-5 z-30 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm backdrop-blur sm:right-6 sm:top-6 sm:px-4 sm:py-1.5 sm:text-xs">
              Featured Category
            </span>
            <CategoryImage
              category={category}
              priority
              className="absolute inset-x-[8%] bottom-[27%] top-[6%] z-10 overflow-hidden"
            />
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-5 p-6 sm:p-8 lg:p-9">
              <div className="min-w-0 max-w-[80%]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                  {formatCount(category.count)} products
                </p>
                <h3 className="mt-2 font-playfair text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                  {category.name}
                </h3>
                <p className="mt-3 hidden max-w-lg text-sm leading-relaxed text-white/70 sm:block">
                  {category.description}
                </p>
              </div>
              <ArrowControl featured />
            </div>
          </>
        ) : (
          <>
            <CategoryImage
              category={category}
              className="absolute inset-x-0 bottom-[38%] top-0 z-10 overflow-hidden bg-[#F4F4F6]"
            />
            <span className="absolute left-4 top-4 z-30 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm backdrop-blur">
              {formatCount(category.count)} products
            </span>
            <div className="absolute inset-x-0 bottom-0 z-30 flex min-h-[38%] items-end justify-between gap-3 border-t border-gray-100 bg-white p-5 sm:p-6">
              <div className="min-w-0">
                <h3 className="font-playfair text-xl font-bold leading-snug text-black">
                  {category.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
                  {category.description}
                </p>
              </div>
              <ArrowControl />
            </div>
          </>
        )}
      </Link>
    </motion.article>
  );
}

function CategoryGridSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="min-h-[500px] animate-pulse rounded-2xl bg-gray-100 sm:min-h-[560px] lg:min-h-[680px]" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-h-[280px] animate-pulse rounded-2xl bg-gray-100 sm:min-h-[300px]" />
        ))}
      </div>
    </div>
  );
}

export default function CategoryGrid() {
  const { ref } = useScrollReveal({ threshold: 0.05 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const names = await api.products.getCategories();
        const categoryNames = (Array.isArray(names) ? names : []).filter(Boolean);

        // Categories always render, even if the count lookup below fails.
        // Counts are best-effort: product counting uses the minimal endpoint.
        const minimal = await api.products.getMinimal(1000).catch(() => []);
        const counts = {};
        for (const item of Array.isArray(minimal) ? minimal : []) {
          const cat = (item?.category || '').trim();
          if (!cat) continue;
          counts[cat] = (counts[cat] || 0) + 1;
        }

        if (!active) return;

        const mapped = categoryNames.map((name, index) => ({
          name,
          count: counts[name] || 0,
          href: `/products?category=${encodeURIComponent(name)}`,
          description: descriptionForCategory(name),
          image: imageForCategory(name, index),
        }));

        setCategories(mapped);
      } catch (err) {
        // API unreachable — fall back to the site's standard category list so
        // the section never shows empty on the homepage.
        console.error('Failed to load categories:', err);
        if (!active) return;
        setCategories(FALLBACK_CATEGORIES.map((name, index) => ({
          name,
          count: 0,
          href: `/products?category=${encodeURIComponent(name)}`,
          description: descriptionForCategory(name),
          image: imageForCategory(name, index),
        })));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCategories();
    return () => { active = false; };
  }, []);

  const browseCategories = categories;
  const featuredCategory = browseCategories.find((category) => /furniture/i.test(category.name)) || browseCategories[0];
  const smallCategories = browseCategories.filter((category) => category !== featuredCategory);

  return (
    <section ref={ref} className="overflow-hidden bg-white py-16 font-jost sm:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <AnimatedSection animation="fade-up" className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            Browse by Category
          </span>
          <h2 className="mt-3 font-playfair text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">
            Explore Our Product Categories
          </h2>
          <p className="mt-5 text-sm font-normal leading-relaxed text-gray-500 sm:text-base">
            Find exactly what you need from our wide range of products
          </p>
        </AnimatedSection>

        {loading ? (
          <CategoryGridSkeleton />
        ) : browseCategories.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-400" strokeWidth={1.5} />
            <p className="mt-4 font-semibold text-black">No categories available yet.</p>
          </div>
        ) : browseCategories.length < 3 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {browseCategories.map((category, index) => (
              <CategoryCard key={category.name} category={category} index={index} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              {featuredCategory && <CategoryCard category={featuredCategory} index={0} featured />}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:min-h-[680px] lg:grid-rows-2">
                {smallCategories.slice(0, 4).map((category, index) => (
                  <CategoryCard key={category.name} category={category} index={index + 1} />
                ))}
              </div>
            </div>

            <div className="mt-10 text-center sm:mt-12">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-sm transition-all duration-300 hover:bg-neutral-800 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                View All Categories
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
