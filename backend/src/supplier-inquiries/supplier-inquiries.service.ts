import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupplierInquiriesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId?: string, userEmail?: string) {
    const isAdmin = userEmail === 'rehanilyas20196@gmail.com';
    let query = this.supabase
      .from('supplier_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async create(data: {
    item_name: string;
    details: string;
    quantity: number;
    unit?: string;
  }, userId?: string, userEmail?: string, userName?: string) {
    const payload: any = {
      item_name: data.item_name,
      details: data.details,
      quantity: data.quantity,
      unit: data.unit || 'Pcs',
      status: 'pending',
    };

    if (userId) payload.user_id = userId;
    if (userEmail) payload.user_email = userEmail;
    if (userName) payload.user_name = userName;

    const { data: result, error } = await this.supabase
      .from('supplier_inquiries')
      .insert([payload])
      .select();
    if (error) throw new InternalServerErrorException(error.message);
    return result;
  }

  async updateStatus(id: number, status: string, adminNotes?: string, supplierRef?: string) {
    const updateData: any = { status, reviewed_at: new Date().toISOString() };
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;
    if (supplierRef !== undefined) updateData.supplier_ref = supplierRef;

    const { data, error } = await this.supabase
      .from('supplier_inquiries')
      .update(updateData)
      .eq('id', id)
      .select();
    if (error) throw new InternalServerErrorException(error.message);

    if (data && data.length > 0 && data[0].user_id && (status === 'approved' || status === 'rejected')) {
      const inquiry = data[0];
      const notifType = status === 'approved' ? 'success' : 'error';
      const notifTitle = status === 'approved' ? 'Supplier Quote Approved' : 'Supplier Quote Rejected';
      const notifMessage = status === 'approved'
        ? `Your supplier inquiry for "${inquiry.item_name}" has been approved. Reference: ${supplierRef || 'N/A'}`
        : `Your supplier inquiry for "${inquiry.item_name}" has been rejected. Notes: ${adminNotes || 'N/A'}`;

      await this.supabase.from('notifications').insert([{
        user_id: inquiry.user_id,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        data: { inquiry_id: inquiry.id },
      }]);
    }

    return data;
  }

  async remove(id: number) {
    const { error } = await this.supabase
      .from('supplier_inquiries')
      .delete()
      .eq('id', id);
    if (error) throw new InternalServerErrorException(error.message);
    return { deleted: true };
  }
}
