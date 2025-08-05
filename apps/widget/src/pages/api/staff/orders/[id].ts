import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const orderId = parseInt(id as string);

  if (req.method === 'PUT') {
    try {
      const { status, finalAmount, notes, trackingNumber, paymentMethod } = req.body;

      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (finalAmount !== undefined) {
        updateData.finalAmount = finalAmount;
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

      if (error) throw error;

      // Create status history entry
      await supabaseAdmin
        .from('OrderStatusHistory')
        .insert({
          orderId,
          status,
          notes: notes || `Status updated to ${status}`,
          updatedBy: 1 // Default staff member
        });

      res.status(200).json(order);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  } else if (req.method === 'DELETE') {
    try {
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

      if (error) throw error;

      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 