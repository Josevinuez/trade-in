import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    if (!supabaseAdmin) {
      console.error('Trade-in Track API: supabaseAdmin not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const { email, orderNumber } = req.body;

    if (!email || !orderNumber) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Email and order number are required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
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
        deviceCondition:DeviceCondition(*),
        storageOption:DeviceStorageOption(*)
      `)
      .eq('orderNumber', orderNumber)
      .eq('customer.email', email)
      .single();

    if (orderError || !order) {
      console.error('Trade-in Track API: Order lookup error:', orderError);
      return res.status(404).json({ 
        error: 'Order not found',
        details: 'No order found with the provided email and order number'
      });
    }

    // Get status history
    const { data: statusHistory, error: historyError } = await supabaseAdmin
      .from('OrderStatusHistory')
      .select('*')
      .eq('orderId', order.id)
      .order('createdAt', { ascending: true });

    if (historyError) {
      console.error('Trade-in Track API: Status history error:', historyError);
      // Continue without status history
    }

    // Ensure status is always present with a default value
    const orderStatus = order.status || 'PENDING';
    
    console.log('Trade-in Track API: Successfully retrieved order:', order.id, 'with status:', orderStatus);
    console.log('Trade-in Track API: Full order data:', order);
    
    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: orderStatus,
        estimatedValue: order.quotedAmount || order.estimatedValue,
        finalAmount: order.finalAmount,
        submittedAt: order.submittedAt,
        processedAt: order.processedAt,
        completedAt: order.completedAt,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        deviceModel: `${order.deviceModel.brand.name} ${order.deviceModel.name}`,
        deviceCondition: order.deviceCondition.name,
        storageOption: order.storageOption?.storage || 'Unknown',
        notes: order.notes,
        statusHistory: statusHistory || []
      }
    });

  } catch (error) {
    console.error('Trade-in Track API: Error:', error);
    res.status(500).json({ 
      error: 'Failed to track order',
      details: 'An unexpected error occurred. Please try again.'
    });
  }
}