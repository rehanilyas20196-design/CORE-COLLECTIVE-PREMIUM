import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MessagesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabase
      .from('user_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async create(userId: string, sender: string, message: string) {
    const { data, error } = await this.supabase
      .from('user_messages')
      .insert([{ user_id: userId, sender, message }])
      .select();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(userId: string, id: number) {
    const { error } = await this.supabase
      .from('user_messages')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { deleted: true };
  }

  async clear(userId: string) {
    const { error } = await this.supabase
      .from('user_messages')
      .delete()
      .eq('user_id', userId);
    if (error) throw new InternalServerErrorException(error.message);
    return { cleared: true };
  }
}
