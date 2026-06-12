'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, LayoutGrid, List, Star, Loader, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import ProductCard from '../../components/products/ProductCard';
import ProductCardSkeleton from '../../components/products/ProductCardSkeleton';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low–High' },
  { value: 'price_desc', label: 'Price: High–Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const categoryList = ['Electronics', 'Clothing', 'Furniture', 'Pet Supplies', 'Tools', 'Sports', 'Modern Tech'];
const cities = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Multan', 'International'];
const PAGE_SIZE = 24;

function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: '', category: '', minPrice: '', maxPrice: '', moq: '',
    cities: [], minRating: 0, stockStatus: [], verifiedOnly: false,
    featuredOnly: false, sort: 'relevance',
  });

  // Read search from URL on mount
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setFilters(prev => ({ ...prev, search: q }));
    }
  }, [searchParams]);

  const fetchFeatured = useCallback(async () => {
    try {
      const { data } = await supabase.from('products').select('*').eq('is_active', true).eq('status', 'active').eq('is_featured', true).limit(4).order('rating', { ascending: false });
      if (data) setFeaturedProducts(data);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchFeatured(); }, [fetchFeatured]);

  const fetchProducts = useCallback(async (append = false) => {
    const loader = append ? setLoadingMore : setLoading;
    loader(true);
    try {
      let q = supabase.from('products').select('*', { count: 'exact' });
      q = q.eq('is_active', true).eq('status', 'active');

      if (filters.category) q = q.eq('category', filters.category);
      if (filters.search) q = q.ilike('name', `%${filters.search}%`);
      if (filters.minPrice) q = q.gte('price', Number(filters.minPrice));
      if (filters.maxPrice) q = q.lte('price', Number(filters.maxPrice));
      if (filters.moq === '1-10') q = q.lte('moq', 10);
      else if (filters.moq === '11-50') q = q.and('moq.gte.11,moq.lte.50');
      else if (filters.moq === '51-200') q = q.and('moq.gte.51,moq.lte.200');
      else if (filters.moq === '200+') q = q.gte('moq', 200);
      if (filters.minRating > 0) q = q.gte('rating', filters.minRating);
      if (filters.verifiedOnly) q = q.eq('is_verified', true);
      if (filters.featuredOnly) q = q.eq('is_featured', true);

      if (!append) {
        if (filters.sort === 'newest') q = q.order('created_at', { ascending: false });
        else if (filters.sort === 'price_asc') q = q.order('price', { ascending: true });
        else if (filters.sort === 'price_desc') q = q.order('price', { ascending: false });
        else if (filters.sort === 'rating') q = q.order('rating', { ascending: false });
        else if (filters.sort === 'popular') q = q.order('reviews_count', { ascending: false });
        else q = q.order('id', { ascending: false });
      }

      const currentPage = append ? page : 0;
      const from = currentPage * PAGE_SIZE;
      q = q.range(from, from + PAGE_SIZE - 1);

      const { data, count, error } = await q;
      if (error) throw error;
      if (append) setProducts(prev => [...prev, ...(data || [])]);
      else setProducts(data || []);
      setTotalCount(count || 0);
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      loader(false);
    }
  }, [filters, page]);

  useEffect(() => {
    setPage(0);
    fetchProducts(false);
  }, [filters]);

  useEffect(() => {
    if (page > 0) fetchProducts(true);
  }, [page]);

  const activeFilterCount = [filters.category, filters.minPrice, filters.maxPrice, filters.moq, filters.minRating > 0, filters.verifiedOnly, filters.featuredOnly, filters.cities.length > 0].filter(Boolean).length;

  const clearFilters = () => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', moq: '', cities: [], minRating: 0, stockStatus: [], verifiedOnly: false, featuredOnly: false, sort: 'relevance' });

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        {activeFilterCount > 0 && <button onClick={clearFilters} className="text-sm text-primary hover:text-primary-700 transition-colors">Clear All</button>}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
        <div className="space-y-1">
          <button onClick={() => updateFilter('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-primary/20 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>All Categories</button>
          {categoryList.map(cat => (
            <button key={cat} onClick={() => updateFilter('category', cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat ? 'bg-primary/20 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-200" />
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Range (PKR)</h4>
        <div className="flex items-center gap-2">
          <input type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} placeholder="Min" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary" />
          <span className="text-gray-500">–</span>
          <input type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} placeholder="Max" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-primary" />
        </div>
      </div>
      <div className="border-t border-gray-200" />
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Min. Order Qty</h4>
        <select value={filters.moq} onChange={e => updateFilter('moq', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:border-primary">
          <option value="">Any</option>
          <option value="1-10">1–10</option>
          <option value="11-50">11–50</option>
          <option value="51-200">51–200</option>
          <option value="200+">200+</option>
        </select>
      </div>
      <div className="border-t border-gray-200" />
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Supplier City</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {cities.map(city => (
            <label key={city} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filters.cities.includes(city)} onChange={e => updateFilter('cities', e.target.checked ? [...filters.cities, city] : filters.cities.filter(c => c !== city))} className="w-4 h-4 rounded border-gray-300 bg-white text-primary focus:ring-primary" />
              <span className="text-sm text-gray-700">{city}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-200" />
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Minimum Rating</h4>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => updateFilter('minRating', filters.minRating === star ? 0 : star)}
              className={`p-1 rounded transition-colors ${star <= filters.minRating ? 'text-amber-400' : 'text-gray-400 hover:text-gray-600'}`}>
              <Star className={`w-5 h-5 ${star <= filters.minRating ? 'fill-amber-400' : ''}`} />
            </button>
          ))}
          {filters.minRating > 0 && <span className="text-xs text-gray-500 ml-2">& up</span>}
        </div>
      </div>
      <div className="border-t border-gray-200" />
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700">Verified Suppliers Only</span>
          <button onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
            className={`w-10 h-5 rounded-full transition-colors relative ${filters.verifiedOnly ? 'bg-primary' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.verifiedOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700">Featured Only</span>
          <button onClick={() => updateFilter('featuredOnly', !filters.featuredOnly)}
            className={`w-10 h-5 rounded-full transition-colors relative ${filters.featuredOnly ? 'bg-primary' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.featuredOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-14 sm:py-20">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-primary">Products</span>
            </nav>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-500">
                  Wholesale Marketplace
                </h1>
                <p className="text-gray-700 text-lg flex items-center gap-2">
                  <span>{totalCount.toLocaleString()} products</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  <span>Verified suppliers</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  <span>Bulk pricing</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">Trusted by 50,000+ buyers</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search + Category Pills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" value={filters.search} onChange={e => updateFilter('search', e.target.value)}
                placeholder="Search by product name, category, or supplier..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-gray-500 font-medium self-center mr-1">Categories:</span>
            {categoryList.map(cat => (
              <button key={cat} onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filters.category === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}>
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      {!filters.category && !filters.search && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Featured Products</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {featuredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-24 space-y-6 bg-white border border-gray-200 rounded-2xl p-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin">
              <FilterSidebar />
            </div>
          </motion.aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && <span className="w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>}
                </button>
                <p className="text-sm text-gray-600">
                  {loading ? 'Loading...' : <><span className="text-gray-900 font-semibold">{totalCount.toLocaleString()}</span> results</>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary">
                  {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="hidden sm:flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary">
                    {filters.category}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('category', '')} />
                  </span>
                )}
                {filters.minPrice && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700">
                    Min: PKR {Number(filters.minPrice).toLocaleString()}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('minPrice', '')} />
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700">
                    Max: PKR {Number(filters.maxPrice).toLocaleString()}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('maxPrice', '')} />
                  </span>
                )}
                {filters.minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700">
                    {filters.minRating}+ Stars
                    <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('minRating', 0)} />
                  </span>
                )}
                {filters.verifiedOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-700">
                    Verified Only
                    <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('verifiedOnly', false)} />
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-700">
                    Search: &ldquo;{filters.search}&rdquo;
                    <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter('search', '')} />
                  </span>
                )}
                <button onClick={clearFilters} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">Clear all</button>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all">
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                  {products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} index={idx} />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-10">
                    <button onClick={() => setPage(p => p + 1)} disabled={loadingMore}
                      className="px-8 py-3.5 bg-gradient-to-r from-primary to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 inline-flex items-center gap-2">
                      {loadingMore ? <Loader className="w-5 h-5 animate-spin" /> : null}
                      {loadingMore ? 'Loading...' : 'Load More Products'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white border-t border-gray-200 rounded-t-3xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-4 pb-24"><FilterSidebar /></div>
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <button onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-primary to-primary-700 text-white rounded-xl font-semibold">Apply Filters</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsPage />
    </Suspense>
  );
}
