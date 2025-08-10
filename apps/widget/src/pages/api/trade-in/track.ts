import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';
import { withRateLimit } from '../../../lib/security';
import { z } from 'zod';

const trackSchema = z.object({
  email: z.string().email(),
  orderNumber: z.string().min(3),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, orderNumber } = trackSchema.parse(req.body);

    if (!email || !orderNumber) {
      return res.status(400).json({ error: 'Email and order number are required' });
    }

    // Find the order by email and order number
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
        deviceCondition:DeviceCondition(*)
      `)
      .eq('orderNumber', orderNumber)
      .eq('customer.email', email)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found. Please check your email and order number.' });
    }

    // Format the response
    const orderStatus = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      quotedAmount: parseFloat(order.quotedAmount.toString()),
      finalAmount: order.finalAmount ? parseFloat(order.finalAmount.toString()) : undefined,
      submittedAt: order.submittedAt,
      processedAt: order.processedAt || undefined,
      completedAt: order.completedAt || undefined,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
      deviceModel: `${order.deviceModel.brand.name} ${order.deviceModel.name}`,
      deviceCondition: order.deviceCondition.name,
      notes: order.notes,
    };

    return res.status(200).json(orderStatus);
  } catch (error: any) {
    console.error('Order tracking error:', error);
    return res.status(500).json({ error: 'Failed to track order', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export default withRateLimit({ windowMs: 60_000, limit: 60, keyPrefix: 'track:' })(handler);