import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple security check - just verify we have a token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;
  const orderId = parseInt(id as string);

  if (!orderId || isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  if (req.method === 'PUT') {
    try {
      if (!supabaseAdmin) {
        console.error('Orders API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { status, finalAmount, notes, trackingNumber, paymentMethod, sendForApproval, deviceConditionId } = req.body;

      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (finalAmount !== undefined) {
        updateData.finalAmount = finalAmount;
      }

      if (deviceConditionId !== undefined) {
        updateData.deviceConditionId = parseInt(String(deviceConditionId));
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      if (paymentMethod !== undefined) {
        updateData.paymentMethod = paymentMethod;
      }

      if (status === 'PROCESSING') {
        updateData.processedAt = new Date().toISOString();
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date().toISOString();
      }

      // When staff wants to send revised amount for customer approval
      if (sendForApproval) {
        updateData.status = 'AWAITING_APPROVAL';
      }

      const { data: order, error } = await supabaseAdmin
        .from('TradeInOrder')
        .update(updateData)
        .eq('id', orderId)
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

      if (error) {
        console.error('Orders API: Update error:', error);
        return res.status(500).json({ 
          error: 'Failed to update order',
          details: error.message || 'Database error occurred'
        });
      }

      // Create status history entry
      await supabaseAdmin
        .from('OrderStatusHistory')
        .insert({
          orderId: orderId,
          status: updateData.status,
          notes: notes || (sendForApproval ? 'Sent to customer for approval' : `Status updated to ${updateData.status}`),
          updatedBy: 1 // Default staff user ID
        });

      console.log('Orders API: Successfully updated order:', orderId);
      res.status(200).json(order);
    } catch (error) {
      console.error('Orders API: Error updating order:', error);
      res.status(500).json({ 
        error: 'Failed to update order',
        details: 'An unexpected error occurred. Please try again.'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      if (!supabaseAdmin) {
        console.error('Orders API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      // Delete status history first
      await supabaseAdmin
        .from('OrderStatusHistory')
        .delete()
        .eq('orderId', orderId);

      // Delete the order
      const { error } = await supabaseAdmin
        .from('TradeInOrder')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Orders API: Delete error:', error);
        return res.status(500).json({ 
          error: 'Failed to delete order',
          details: error.message || 'Database error occurred'
        });
      }

      console.log('Orders API: Successfully deleted order:', orderId);
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Orders API: Error deleting order:', error);
      res.status(500).json({ 
        error: 'Failed to delete order',
        details: 'An unexpected error occurred. Please try again.'
      });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}