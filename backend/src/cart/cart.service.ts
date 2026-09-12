import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CartService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async addOrUpdate(userId: string, productId: number, qty: number, _productData: any) {
    const { data: existing } = await this.supabase
      .from('cart_items')
      .select('id, qty')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      const { error } = await this.supabase
        .from('cart_items')
        .update({ qty: existing.qty + qty, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw new InternalServerErrorException(error.message);
      return { updated: true };
    }

    const { error } = await this.supabase
      .from('cart_items')
      .insert([{ user_id: userId, product_id: productId, qty }]);
    if (error) throw new InternalServerErrorException(error.message);
    return { added: true };
  }

  async updateQty(userId: string, productId: number, qty: number) {
    const { error } = await this.supabase
      .from('cart_items')
      .update({ qty, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw new InternalServerErrorException(error.message);
    return { updated: true };
  }

  async remove(userId: string, productId: number) {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw new InternalServerErrorException(error.message);
    return { removed: true };
  }

  async clear(userId: string) {
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    if (error) throw new InternalServerErrorException(error.message);
    return { cleared: true };
  }
}
