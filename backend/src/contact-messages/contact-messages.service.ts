import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ContactMessagesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(status?: string) {
    let query = this.supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async reply(id: number, adminReply: string, adminEmail: string) {
    const { data: message, error: fetchError } = await this.supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError || !message) throw new InternalServerErrorException('Message not found');

    const { error: updateError } = await this.supabase
      .from('contact_messages')
      .update({
        admin_reply: adminReply,
        replied_at: new Date().toISOString(),
        status: 'replied',
      })
      .eq('id', id);
    if (updateError) throw new InternalServerErrorException(updateError.message);

    // Create notification for the user
    if (message.email) {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('email', message.email)
        .single();

      if (profile?.id) {
        await this.supabase
          .from('notifications')
          .insert([{
            user_id: profile.id,
            type: 'info',
            title: 'Reply to your inquiry',
            message: `Admin replied to your message "${message.subject?.substring(0, 50)}": ${adminReply}`,
            data: { contact_message_id: id },
          }]);
      }
    }

    return { success: true };
  }

  async remove(id: number) {
    const { error } = await this.supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { deleted: true };
  }
}
