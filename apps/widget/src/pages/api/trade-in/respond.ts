import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';
import { withSecurity } from '../../../lib/security';
import { schemas } from '../../../lib/validation';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, orderNumber, decision } = req.body; // Validation handled by middleware

    if (!email || !orderNumber || !decision) {
      return res.status(400).json({ error: 'Email, order number and decision are required' });
    }

    // Find order and ensure it belongs to the email
    const { data: order, error: orderError } = await supabaseAdmin
      .from('TradeInOrder')
      .select(`
        *,
        customer:Customer(*),
        deviceModel:DeviceModel(
          *,
          brand:DeviceBrand(*),
          category:DeviceCategory(*)
        ),
        deviceCondition:DeviceCondition(*),
        storageOption:DeviceStorageOption(*)
      `)
      .eq('orderNumber', orderNumber)
      .eq('customer.email', email)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found for provided email and order number' });
    }

    // Only allow response when awaiting approval
    if (order.status !== 'AWAITING_APPROVAL') {
      return res.status(400).json({ error: `Order is not awaiting approval (current status: ${order.status})` });
    }

    const approved = decision === 'approve';
    const newStatus = approved ? 'PROCESSING' : 'REJECTED';

    const updateData: any = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (approved) {
      updateData.processedAt = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('TradeInOrder')
      .update(updateData)
      .eq('id', order.id)
      .select(`
        *,
        customer:Customer(*),
        deviceModel:DeviceModel(
          *,
          brand:DeviceBrand(*),
          category:DeviceCategory(*)
        ),
        deviceCondition:DeviceCondition(*),
        storageOption:DeviceStorageOption(*)
      `)
      .single();

    if (updateError) throw updateError;

    // History entry
    await supabaseAdmin
      .from('OrderStatusHistory')
      .insert({
        orderId: order.id,
        status: newStatus,
        notes: approved
          ? `Customer approved revised amount ${order.finalAmount ?? order.quotedAmount}`
          : 'Customer declined revised amount',
        updatedBy: 1,
      });

    const responsePayload = {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      quotedAmount: parseFloat(updated.quotedAmount?.toString?.() ?? `${updated.quotedAmount}`),
      finalAmount: updated.finalAmount
        ? parseFloat(updated.finalAmount?.toString?.() ?? `${updated.finalAmount}`)
        : undefined,
      submittedAt: updated.submittedAt,
      processedAt: updated.processedAt || undefined,
      completedAt: updated.completedAt || undefined,
      customerName: `${updated.customer.firstName} ${updated.customer.lastName}`.trim(),
      deviceModel: `${updated.deviceModel.brand.name} ${updated.deviceModel.name}`,
      deviceCondition: updated.deviceCondition.name,
      notes: updated.notes,
    };

    return res.status(200).json(responsePayload);
  } catch (error: any) {
    console.error('Order respond error:', error);
    return res.status(500).json({ error: 'Failed to respond to order', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export default withSecurity({
  auth: false, // Public endpoint but needs security
  rateLimit: {
    windowMs: 60 * 1000,
    limit: 30,
    keyPrefix: 'respond:',
  },
  cors: true,
  sizeLimit: '1mb',
  validation: {
    POST: schemas.order.respond,
  },
  securityHeaders: true,
})(handler);


