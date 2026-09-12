import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DealsService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*');
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }
}
