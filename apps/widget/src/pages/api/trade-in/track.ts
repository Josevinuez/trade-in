import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';
import { withSecurity } from '../../../lib/security';
import { schemas } from '../../../lib/validation';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, orderNumber } = req.body; // Validation handled by middleware

    if (!email || !orderNumber) {
      return res.status(400).json({ error: 'Email and order number are required' });
    }

    // Find the order by email and order number
    const { data: order, error: orderError } = await supabaseAdmin
      .from('trade_in_orders')
      .select(`
        *,
        customer:customers(*),
        deviceModel:device_models(
          *,
          brand:device_brands(*),
          category:device_categories(*)
        ),
        deviceCondition:device_conditions(*)
      `)
      .eq('order_number', orderNumber)
      .eq('customer.email', email)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found. Please check your email and order number.' });
    }

    // Format the response
    const orderStatus = {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      quotedAmount: parseFloat(order.quoted_amount.toString()),
      finalAmount: order.final_amount ? parseFloat(order.final_amount.toString()) : undefined,
      submittedAt: order.submitted_at,
      processedAt: order.processed_at || undefined,
      completedAt: order.completed_at || undefined,
      customerName: `${order.customer.first_name} ${order.customer.last_name}`.trim(),
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

export default withSecurity({
  auth: false, // Public endpoint but needs security
  rateLimit: {
    windowMs: 60 * 1000,
    limit: 60,
    keyPrefix: 'track:',
  },
  cors: true,
  sizeLimit: '1mb',
  validation: {
    POST: schemas.order.track,
  },
  securityHeaders: true,
})(handler);