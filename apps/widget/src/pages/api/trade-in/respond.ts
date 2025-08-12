import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    if (!supabaseAdmin) {
      console.error('Trade-in Respond API: supabaseAdmin not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const { orderId, email, response, notes } = req.body;

    if (!orderId || !email || !response) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Order ID, email, and response are required'
      });
    }

    // Validate response type
    const validResponses = ['ACCEPTED', 'REJECTED', 'COUNTER_OFFER'];
    if (!validResponses.includes(response)) {
      return res.status(400).json({ 
        error: 'Invalid response type',
        details: 'Response must be ACCEPTED, REJECTED, or COUNTER_OFFER'
      });
    }

    // Find order and ensure it belongs to the email
    const { data: order, error: orderError } = await supabaseAdmin
      .from('TradeInOrder')
      .select(`
        *,
        customer:Customer(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Trade-in Respond API: Order lookup error:', orderError);
      return res.status(404).json({ 
        error: 'Order not found',
        details: 'The specified order could not be found'
      });
    }

    // Verify email matches order
    if (order.customer?.email !== email) {
      return res.status(403).json({ 
        error: 'Access denied',
        details: 'This order does not belong to the specified email'
      });
    }

    // Update order status
    const updateData: any = {
      status: response === 'ACCEPTED' ? 'ACCEPTED' : response === 'REJECTED' ? 'REJECTED' : 'COUNTER_OFFER',
      updatedAt: new Date().toISOString()
    };

    if (notes) {
      updateData.notes = notes;
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('TradeInOrder')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Trade-in Respond API: Update error:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update order',
        details: updateError.message || 'Database error occurred'
      });
    }

    // Create status history entry
    await supabaseAdmin
      .from('OrderStatusHistory')
      .insert({
        orderId: orderId,
        status: updateData.status,
        notes: notes || `Customer ${response.toLowerCase()} the offer`,
        updatedBy: 1 // System user
      });

    console.log('Trade-in Respond API: Successfully processed response for order:', orderId);
    res.status(200).json({
      success: true,
      message: `Order ${response.toLowerCase()} successfully`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Trade-in Respond API: Error:', error);
    res.status(500).json({ 
      error: 'Failed to process response',
      details: 'An unexpected error occurred. Please try again.'
    });
  }
}


