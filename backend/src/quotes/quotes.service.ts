import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class QuotesService {
  constructor(private supabase: SupabaseService) {}

  async create(data: {
    product_id: number;
    buyer_name: string;
    business_name?: string;
    phone?: string;
    email: string;
    quantity: number;
    message?: string;
  }) {
    const { error } = await this.supabase
      .from('quotes')
      .insert([{
        product_id: data.product_id,
        buyer_name: data.buyer_name,
        business_name: data.business_name || null,
        phone: data.phone || null,
        email: data.email,
        quantity: data.quantity,
        message: data.message || null,
      }]);
    if (error) throw new InternalServerErrorException(error.message);
    return { success: true };
  }
}
