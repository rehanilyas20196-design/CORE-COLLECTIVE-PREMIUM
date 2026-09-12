import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class NotificationsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async getUnreadCount(userId: string) {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw new InternalServerErrorException(error.message);
    return count || 0;
  }

  async create(userId: string, type: string, title: string, message: string, data?: any) {
    const { data: result, error } = await this.supabase
      .from('notifications')
      .insert([{ user_id: userId, type, title, message, data: data || {} }])
      .select();
    if (error) throw new InternalServerErrorException(error.message);
    return result;
  }

  async markAsRead(notificationId: number) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw new InternalServerErrorException(error.message);
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw new InternalServerErrorException(error.message);
    return { success: true };
  }

  async remove(notificationId: number) {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    if (error) throw new InternalServerErrorException(error.message);
    return { deleted: true };
  }
}
