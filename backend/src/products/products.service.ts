import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProductsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(searchQuery?: string) {
    let query = this.supabase.from('products').select('*');
    if (searchQuery?.trim()) {
      query = query.or(`name.ilike.%${searchQuery.trim()}%,category.ilike.%${searchQuery.trim()}%`);
    }
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException(error.message);
    return data;
  }

  async findRelated(category: string, productId: number) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .neq('id', productId)
      .limit(6);
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async findCategories() {
    const { data, error } = await this.supabase
      .from('products')
      .select('category');
    if (error) throw new InternalServerErrorException(error.message);
    const unique = [...new Set((data || []).map((item: any) => item.category).filter(Boolean))];
    return unique;
  }

  async findSellerProducts(limit = 12) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .limit(limit);
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async findMinimal(limit = 200) {
    const { data, error } = await this.supabase
      .from('products')
      .select('id, name, category, price, stock')
      .limit(Math.min(Math.max(limit, 1), 1000));
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async create(dto: any) {
    const payload = {
      name: dto.name,
      description: dto.description || '',
      category: dto.category || '',
      image_url: dto.image_url || '',
      images: dto.images || [],
      price: dto.price || null,
      price_min: dto.price_min || null,
      price_max: dto.price_max || null,
      stock: dto.stock ?? 0,
      moq: dto.moq ?? 1,
      unit: dto.unit || 'Pcs',
      whatsapp: dto.whatsapp || '',
      stock_status: dto.stock_status || 'in_stock',
      specifications: dto.specifications || {},
      pricing_tiers: dto.pricing_tiers || [],
      supplier_name: dto.supplier_name || 'Admin',
      is_verified: true,
      status: 'active',
      rating: 0,
      review_count: 0,
    };

    const { data, error } = await this.supabase
      .from('products')
      .insert([payload])
      .select();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(id: number) {
    const { data: product, error: fetchError } = await this.supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
    if (fetchError || !product) throw new NotFoundException('Product not found');

    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { deleted: true };
  }
}
