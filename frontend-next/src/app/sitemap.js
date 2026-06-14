const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://frontend-next-ten-topaz.vercel.app';

export default async function sitemap() {
  const staticRoutes = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/suppliers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/supplier/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/supplier/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  let productRoutes = [];
  let categoryRoutes = [];
  try {
    const { supabase } = await import('../lib/supabase');
    if (!supabase) throw new Error('Supabase not configured');
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at, category')
      .eq('is_active', true)
      .eq('status', 'active');
    productRoutes = (products || []).map((product) => ({
      url: `${BASE_URL}/products/${product.id}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const categories = [...new Set((products || []).map(p => p.category).filter(Boolean))];
    categoryRoutes = categories.map((cat) => ({
      url: `${BASE_URL}/products?category=${encodeURIComponent(cat)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Sitemap product fetch failed:', e);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
