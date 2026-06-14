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

  async findAll() {
    const { data, error } = await this.supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async updateStatus(id: number, status: string, adminNote?: string) {
    const { error } = await this.supabase
      .from('quotes')
      .update({ status, admin_note: adminNote || null })
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { success: true };
  }

  async remove(id: number) {
    const { error } = await this.supabase
      .from('quotes')
      .delete()
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { deleted: true };
  }
}
