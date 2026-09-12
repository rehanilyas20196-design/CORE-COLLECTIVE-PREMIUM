import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ReviewsService {
  constructor(private supabase: SupabaseService) {}

  async findByProduct(productId: number) {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async create(reviewData: {
    product_id: number;
    rating: number;
    comment: string;
    name: string;
  }) {
    const payload = {
      product_id: reviewData.product_id,
      rating: reviewData.rating,
      comment: reviewData.comment,
      name: reviewData.name,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('reviews')
      .insert([payload])
      .select();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
