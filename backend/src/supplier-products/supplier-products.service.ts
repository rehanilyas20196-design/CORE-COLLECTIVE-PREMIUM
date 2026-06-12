import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupplierProductsService {
  private readonly adminEmail = 'rehanilyas20196@gmail.com';

  constructor(private supabase: SupabaseService) {}

  async create(dto: any, userId: string, userEmail: string, userName: string) {
    const payload = {
      supplier_id: userId,
      supplier_email: userEmail,
      supplier_name: userName,
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
      status: 'pending',
    };

    const { data, error } = await this.supabase
      .from('supplier_products')
      .insert([payload])
      .select();
    if (error) throw new InternalServerErrorException(error.message);

    return data;
  }

  async findAll(userId?: string, userEmail?: string) {
    const isAdmin = userEmail === this.adminEmail;

    let query = this.supabase
      .from('supplier_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin && userId) {
      query = query.eq('supplier_id', userId);
    }

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async findMine(userId: string) {
    const { data, error } = await this.supabase
      .from('supplier_products')
      .select('*')
      .eq('supplier_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async updateStatus(id: number, status: string, adminNotes?: string) {
    const { data: product, error: fetchError } = await this.supabase
      .from('supplier_products')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError || !product) throw new NotFoundException('Supplier product not found');

    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

    const { data, error } = await this.supabase
      .from('supplier_products')
      .update(updateData)
      .eq('id', id)
      .select();
    if (error) throw new InternalServerErrorException(error.message);

    if (status === 'approved') {
      const mainProduct = {
        name: product.name,
        description: product.description,
        category: product.category,
        image_url: product.image_url,
        images: product.images || [],
        price: product.price,
        price_min: product.price_min,
        price_max: product.price_max,
        stock: product.stock,
        moq: product.moq,
        unit: product.unit,
        whatsapp: product.whatsapp || '',
        stock_status: product.stock_status || 'in_stock',
        specifications: product.specifications || {},
        pricing_tiers: product.pricing_tiers || [],
        supplier_name: product.supplier_name,
        is_verified: true,
        status: 'active',
        rating: 0,
        review_count: 0,
      };

      const { error: insertError } = await this.supabase
        .from('products')
        .insert([mainProduct]);
      if (insertError) throw new InternalServerErrorException('Failed to insert into products: ' + insertError.message);

      if (product.supplier_id) {
        await this.supabase.from('notifications').insert([{
          user_id: product.supplier_id,
          type: 'success',
          title: 'Product Approved',
          message: `Your product "${product.name}" has been approved and is now live on the marketplace!`,
          data: { supplier_product_id: id },
        }]);
      }
    } else if (status === 'rejected' && product.supplier_id) {
      await this.supabase.from('notifications').insert([{
        user_id: product.supplier_id,
        type: 'error',
        title: 'Product Rejected',
        message: `Your product "${product.name}" has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ''}`,
        data: { supplier_product_id: id },
      }]);
    }

    return data;
  }

  async remove(id: number) {
    const { error } = await this.supabase
      .from('supplier_products')
      .delete()
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { deleted: true };
  }
}
