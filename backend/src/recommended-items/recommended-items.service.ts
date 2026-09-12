import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RecommendedItemsService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase
      .from('recommended_items')
      .select('*');
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }
}
