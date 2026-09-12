import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DiscountMessagesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId?: string, userEmail?: string) {
    const isAdmin = userEmail === 'rehanilyas20196@gmail.com';
    let query = this.supabase
      .from('discount_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async create(data: { user_email: string; user_name: string; message: string }, userId?: string) {
    const { data: result, error } = await this.supabase
      .from('discount_messages')
      .insert([{ ...data, user_id: userId || null, status: 'pending' }])
      .select();
    if (error) throw new InternalServerErrorException(error.message);
    return result;
  }

  async updateStatus(id: number, status: string, adminReply?: string) {
    const updateData: any = { status, reviewed_at: new Date().toISOString() };
    if (adminReply !== undefined) updateData.admin_reply = adminReply;

    const { data, error } = await this.supabase
      .from('discount_messages')
      .update(updateData)
      .eq('id', id)
      .select();
    if (error) throw new InternalServerErrorException(error.message);

    if (data && data.length > 0 && data[0].user_id && (status === 'approved' || status === 'rejected')) {
      const msg = data[0];
      const notifType = status === 'approved' ? 'success' : 'error';
      const notifTitle = status === 'approved' ? 'Discount Request Approved' : 'Discount Request Rejected';
      const notifMessage = status === 'approved'
        ? `Your discount request has been approved! Reply: ${adminReply || 'N/A'}`
        : `Your discount request has been rejected. Reply: ${adminReply || 'N/A'}`;

      await this.supabase.from('notifications').insert([{
        user_id: msg.user_id,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        data: { discount_message_id: msg.id },
      }]);
    }

    return data;
  }

  async remove(id: number) {
    const { error } = await this.supabase
      .from('discount_messages')
      .delete()
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { deleted: true };
  }
}
