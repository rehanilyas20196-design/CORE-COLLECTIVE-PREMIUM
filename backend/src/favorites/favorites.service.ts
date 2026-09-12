import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class FavoritesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async toggle(userId: string, productId: number, _productData: any) {
    const { data: existing } = await this.supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      const { error } = await this.supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);
      if (error) throw new InternalServerErrorException(error.message);
      return { favorited: false };
    }

    const { error } = await this.supabase
      .from('favorites')
      .insert([{ user_id: userId, product_id: productId }]);
    if (error) throw new InternalServerErrorException(error.message);
    return { favorited: true };
  }

  async add(userId: string, productId: number, _productData: any) {
    const { error } = await this.supabase
      .from('favorites')
      .insert([{ user_id: userId, product_id: productId }]);
    if (error) throw new InternalServerErrorException(error.message);
    return { favorited: true };
  }

  async remove(userId: string, productId: number) {
    const { error } = await this.supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);
    if (error) throw new InternalServerErrorException(error.message);
    return { favorited: false };
  }
}
