import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useProducts = (searchQuery = '') => {
  return useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      let q = supabase.from('products').select('*').eq('is_active', true).eq('status', 'active').order('created_at', { ascending: false });
      if (searchQuery) q = q.ilike('name', `%${searchQuery}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCategories = () => {
  const { data: allProducts, ...rest } = useProducts();

  const categories = {};
  const categoryList = [];

  if (allProducts) {
    const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    categoryList.push(...uniqueCategories);

    uniqueCategories.forEach(cat => {
      const productsInCat = allProducts
        .filter(p => p.category === cat)
        .sort((a, b) => {
          const aHas = a.image_url || a.image ? 1 : 0;
          const bHas = b.image_url || b.image ? 1 : 0;
          return bHas - aHas;
        })
        .slice(0, 8);
      categories[cat] = productsInCat;
    });
  }

  return { categories, categoryList, ...rest };
};

export const useRecommendedItems = () => {
  return useQuery({
    queryKey: ['recommended_items'],
    queryFn: async () => {
      const data = await api.recommendedItems.getAll();
      return data;
    },
  });
};

export const useConfirmedOrdersCount = (userId) => {
  return useQuery({
    queryKey: ['confirmed_orders_count', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const count = await api.orders.getConfirmedCount();
      return count || 0;
    },
    enabled: !!userId,
  });
};

export const useOrders = (userId) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await api.orders.getAll();
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useRelatedProducts = (category, productId) => {
  return useQuery({
    queryKey: ['related_products', category, productId],
    queryFn: async () => {
      if (!category) return [];
      const data = await api.products.getRelated(category, productId);
      return data || [];
    },
    enabled: !!category,
  });
};

export const useReviews = (productId) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return [];
      const data = await api.reviews.getByProduct(productId);
      return data || [];
    },
    enabled: !!productId,
  });
};
