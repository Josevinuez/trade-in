import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../utils/supabase';
import { withSecurity } from '../../../../lib/security';
import { schemas } from '../../../../lib/validation';
import { AuthenticatedRequest } from '../../../../lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const orderId = parseInt(id as string);
  const authenticatedReq = req as AuthenticatedRequest;

  if (req.method === 'PUT') {
    try {
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

      if (error) throw error;

      // Create status history entry
      await supabaseAdmin
        .from('OrderStatusHistory')
        .insert({
          orderId: orderId,
          status: updateData.status,
          notes: notes || (sendForApproval ? 'Sent to customer for approval' : `Status updated to ${updateData.status}`),
          updatedBy: authenticatedReq.user?.id || 1 // Use authenticated user ID
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

// Apply comprehensive security middleware
export default withSecurity({
  auth: true, // Require authentication
  roles: ['staff'], // Only staff can access
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    limit: 60, // 60 requests per minute
    keyPrefix: 'orders:',
  },
  cors: true, // Enable CORS
  sizeLimit: '1mb', // Limit request size
  validation: {
    PUT: schemas.order.update, // Use the order update schema
  },
  securityHeaders: true, // Enable security headers
})(handler);