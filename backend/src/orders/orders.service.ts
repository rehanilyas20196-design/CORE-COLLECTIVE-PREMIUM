import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class OrdersService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId?: string, userEmail?: string) {
    const isAdmin = userEmail === 'rehanilyas20196@gmail.com';

    let query = this.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async findConfirmedCount(userId?: string, userEmail?: string) {
    const isAdmin = userEmail === 'rehanilyas20196@gmail.com';

    let query = this.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed');

    if (!isAdmin && userId) {
      query = query.eq('user_id', userId);
    }

    const { count, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return count || 0;
  }

  async create(orderData: any, userId?: string, userEmail?: string) {
    const payload = {
      user_id: userId || null,
      user_email: userEmail || '',
      full_name: orderData.full_name,
      phone_number: orderData.phone_number,
      province: orderData.province,
      city: orderData.city,
      area: orderData.area,
      building_street: orderData.building_street,
      colony_suburb: orderData.colony_suburb,
      address: orderData.address,
      label: orderData.label || 'HOME',
      total_amount: orderData.total_amount,
      payment_method: orderData.payment_method,
      payment_screenshot: orderData.payment_screenshot || '',
      items: orderData.items || [],
      status: 'pending',
    };

    const { data, error } = await this.supabase
      .from('orders')
      .insert([payload])
      .select();
    if (error) throw new InternalServerErrorException(error.message);

    if (data && data.length > 0 && userId) {
      const order = data[0];
      const trackingHistory = [{ status: 'pending', date: new Date().toISOString(), note: 'Order placed and pending review' }];
      await this.supabase.from('orders').update({ tracking_status: 'pending', tracking_history: JSON.stringify(trackingHistory) }).eq('id', order.id);

      await this.supabase.from('notifications').insert([{
        user_id: userId,
        type: 'pending',
        title: 'Order Placed',
        message: `Your order #ORD-${String(order.id).padStart(6, '0')} has been placed and is pending review. We will notify you once it is confirmed.`,
        data: { order_id: order.id },
      }]);
    }

    return data;
  }

  async updateStatus(orderId: number, status: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select();
    if (error) throw new InternalServerErrorException(error.message);

    if (data && data.length > 0 && data[0].user_id && (status === 'confirmed' || status === 'rejected')) {
      const order = data[0];
      const notifType = status === 'confirmed' ? 'success' : 'error';
      const notifTitle = status === 'confirmed' ? 'Order Confirmed' : 'Order Rejected';
      const notifMessage = status === 'confirmed'
        ? `Your order #ORD-${String(order.id).padStart(6, '0')} has been confirmed! Your items are being prepared.`
        : `Your order #ORD-${String(order.id).padStart(6, '0')} has been rejected. Please contact support for more details.`;

      if (status === 'confirmed') {
        const existingHistory = order.tracking_history || [];
        const newEntry = { status: 'confirmed', date: new Date().toISOString(), note: 'Order confirmed - items are being prepared' };
        const updatedHistory = Array.isArray(existingHistory) ? [...existingHistory, newEntry] : [newEntry];
        await this.supabase.from('orders').update({ tracking_status: 'confirmed', tracking_history: JSON.stringify(updatedHistory) }).eq('id', order.id);
      }

      await this.supabase.from('notifications').insert([{
        user_id: order.user_id,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        data: { order_id: order.id },
      }]);
    }

    return data;
  }

  async updateTracking(orderId: number, trackingStatus: string, note?: string) {
    const { data: order, error: fetchError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (fetchError || !order) throw new NotFoundException('Order not found');

    const existingHistory = order.tracking_history || [];
    const historyArray = Array.isArray(existingHistory) ? existingHistory : [];
    const newEntry = { status: trackingStatus, date: new Date().toISOString(), note: note || getDefaultNote(trackingStatus) };
    const updatedHistory = [...historyArray, newEntry];

    const { data, error } = await this.supabase
      .from('orders')
      .update({ tracking_status: trackingStatus, tracking_history: JSON.stringify(updatedHistory), status: trackingStatus === 'delivered' ? 'delivered' : order.status })
      .eq('id', orderId)
      .select();
    if (error) throw new InternalServerErrorException(error.message);

    if (order.user_id) {
      const statusLabels = { confirmed: 'Confirmed', shipped: 'Shipped', in_transit: 'In Transit', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' };
      const label = statusLabels[trackingStatus] || trackingStatus;
      const notifTitle = `Order #ORD-${String(orderId).padStart(6, '0')} - ${label}`;
      const notifMessage = `Your order #ORD-${String(orderId).padStart(6, '0')} has been updated to "${label}".${note ? ` Note: ${note}` : ''}`;

      await this.supabase.from('notifications').insert([{
        user_id: order.user_id,
        type: trackingStatus === 'delivered' ? 'success' : 'info',
        title: notifTitle,
        message: notifMessage,
        data: { order_id: orderId, tracking_status: trackingStatus },
      }]);
    }

    return data;
  }

  async remove(orderId: number) {
    const { error } = await this.supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    if (error) throw new InternalServerErrorException(error.message);
    return { deleted: true };
  }
}

function getDefaultNote(status: string): string {
  const notes = {
    confirmed: 'Order confirmed - items are being prepared',
    shipped: 'Order has been shipped',
    in_transit: 'Order is in transit',
    out_for_delivery: 'Order is out for delivery',
    delivered: 'Order has been delivered successfully',
  };
  return notes[status] || `Status updated to ${status}`;
}
