import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BuyRequestsService {
  private readonly adminEmail = 'rehanilyas20196@gmail.com';

  constructor(private supabase: SupabaseService) {}

  async create(dto: any, userId: string, userEmail: string, userName: string) {
    const payload = {
      product_id: dto.product_id,
      product_name: dto.product_name || '',
      product_image: dto.product_image || '',
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      phone: dto.phone || '',
      quantity: dto.quantity || 1,
      message: dto.message || '',
      status: 'pending',
    };

    const { data, error } = await this.supabase
      .from('buy_requests')
      .insert([payload])
      .select();
    if (error) throw new InternalServerErrorException(error.message);

    return data;
  }

  async findAll(userId?: string, userEmail?: string) {
    const isAdmin = userEmail === this.adminEmail;
    let query = this.supabase
      .from('buy_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async updateStatus(id: number, status: string, adminNotes?: string) {
    const { data: existing, error: fetchError } = await this.supabase
      .from('buy_requests')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError || !existing) throw new NotFoundException('Buy request not found');

    const updateData: any = { status, reviewed_at: new Date().toISOString() };
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

    const { data, error } = await this.supabase
      .from('buy_requests')
      .update(updateData)
      .eq('id', id)
      .select();
    if (error) throw new InternalServerErrorException(error.message);

    if (existing.user_id) {
      const notifType = status === 'approved' ? 'success' : 'error';
      const notifTitle = status === 'approved' ? 'Purchase Request Approved' : 'Purchase Request Rejected';
      const notifMessage = status === 'approved'
        ? `Your purchase request for "${existing.product_name}" has been approved! We will contact you shortly.`
        : `Your purchase request for "${existing.product_name}" has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ''}`;

      await this.supabase.from('notifications').insert([{
        user_id: existing.user_id,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        data: { buy_request_id: id, product_name: existing.product_name },
      }]);
    }

    return data;
  }

  async remove(id: number) {
    const { error } = await this.supabase
      .from('buy_requests')
      .delete()
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { deleted: true };
  }
}
