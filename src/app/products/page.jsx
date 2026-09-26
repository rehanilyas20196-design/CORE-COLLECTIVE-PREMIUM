'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, LayoutGrid, List, Star, Loader, Sparkles, Shield } from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import ProductCardSkeleton from '../../components/products/ProductCardSkeleton';
import { supabase } from '../../lib/supabase';

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

  useEffect(() => {
    const q = searchParams.get('search') || '';
    const cat = searchParams.get('category') || '';
    setFilters(prev => ({
      ...prev,
      search: q,
      category: cat || prev.category,
    }));
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
      if (filters.search) q = q.or(`name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
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
    <div className="space-y-6 font-jost">
      <div className="flex items-center justify-between">
        <h3 className="font-playfair font-bold text-lg text-black">Filters</h3>
        {activeFilterCount > 0 && <button onClick={clearFilters} className="text-xs font-semibold text-gray-500 hover:text-black transition-colors">Clear All</button>}
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Category</h4>
        <div className="space-y-1">
          <button onClick={() => updateFilter('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${!filters.category ? 'bg-black text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>All Categories</button>
          {categoryList.map(cat => (
            <button key={cat} onClick={() => updateFilter('category', cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filters.category === cat ? 'bg-black text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-100" />
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Price Range ($)</h4>
        <div className="flex items-center gap-2">
          <input type="number" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} placeholder="Min" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-black outline-none focus:border-black" />
          <span className="text-gray-400">–</span>
          <input type="number" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} placeholder="Max" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-black outline-none focus:border-black" />
        </div>
      </div>
      <div className="border-t border-gray-100" />
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Min. Order Qty</h4>
        <select value={filters.moq} onChange={e => updateFilter('moq', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-black outline-none focus:border-black">
          <option value="">Any</option>
          <option value="1-10">1–10</option>
          <option value="11-50">11–50</option>
          <option value="51-200">51–200</option>
          <option value="200+">200+</option>
        </select>
      </div>
      <div className="border-t border-gray-100" />
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Supplier City</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {cities.map(city => (
            <label key={city} className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={filters.cities.includes(city)} onChange={e => updateFilter('cities', e.target.checked ? [...filters.cities, city] : filters.cities.filter(c => c !== city))} className="w-4 h-4 rounded border-gray-300 text-black accent-black" />
              <span className="text-xs text-gray-700">{city}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-100" />
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Minimum Rating</h4>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => updateFilter('minRating', filters.minRating === star ? 0 : star)}
              className={`p-1 rounded transition-colors ${star <= filters.minRating ? 'text-[#FFB800]' : 'text-gray-300 hover:text-gray-500'}`}>
              <Star className={`w-4 h-4 ${star <= filters.minRating ? 'fill-[#FFB800]' : ''}`} />
            </button>
          ))}
          {filters.minRating > 0 && <span className="text-xs text-gray-500 ml-2">& up</span>}
        </div>
      </div>
      <div className="border-t border-gray-100" />
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs text-gray-700 font-medium">Verified Only</span>
          <button onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
            className={`w-9 h-5 rounded-full transition-colors relative ${filters.verifiedOnly ? 'bg-black' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.verifiedOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs text-gray-700 font-medium">Featured Only</span>
          <button onClick={() => updateFilter('featuredOnly', !filters.featuredOnly)}
            className={`w-9 h-5 rounded-full transition-colors relative ${filters.featuredOnly ? 'bg-black' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${filters.featuredOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-jost pt-24 sm:pt-28">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-[#FAF9F6] py-14 sm:py-20 border-b border-gray-100">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <a href="/" className="hover:text-black transition-colors">Home</a>
              <ChevronDown className="w-3 h-3 -rotate-90" />
              <span className="text-black font-semibold">Products</span>
            </nav>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h1 className="font-playfair font-bold text-4xl sm:text-5xl text-black">
                  Wholesale Products
                </h1>
                <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                  <span>{totalCount.toLocaleString()} products listed</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  <span>Verified suppliers</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search + Category Pills */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={filters.search} onChange={e => updateFilter('search', e.target.value)}
                placeholder="Search by product name, category, or supplier..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-full text-black placeholder-gray-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all text-xs sm:text-sm shadow-sm" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider self-center mr-1">Categories:</span>
            {categoryList.map(cat => (
              <button key={cat} onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all ${filters.category === cat ? 'bg-black text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'}`}>
                {cat}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-24 space-y-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main List Grid */}
          <div className="flex-1 min-w-0">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-black font-semibold hover:bg-gray-100">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && <span className="w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>}
                </button>
                <p className="text-xs text-gray-500">
                  {loading ? 'Loading...' : <><span className="text-black font-bold">{totalCount.toLocaleString()}</span> items found</>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-black outline-none focus:border-black font-medium">
                  {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="hidden sm:flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
                <Search className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <h3 className="font-playfair font-bold text-lg text-black mb-1">No products found</h3>
                <p className="text-xs text-gray-500 mb-4">Try clearing filters or searching for another item</p>
                <button onClick={clearFilters} className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-neutral-800">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} index={idx} variant={viewMode} />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-12">
                    <button onClick={() => setPage(p => p + 1)} disabled={loadingMore}
                      className="px-10 py-3.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-neutral-800 transition-all shadow disabled:opacity-50 inline-flex items-center gap-2">
                      {loadingMore ? <Loader className="w-4 h-4 animate-spin" /> : null}
                      {loadingMore ? 'Loading...' : 'Load More Products'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center font-jost">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-black animate-spin" />
          <p className="text-xs text-gray-500">Loading catalog...</p>
        </div>
      </div>
    }>
      <ProductsPage />
    </Suspense>
  );
}
