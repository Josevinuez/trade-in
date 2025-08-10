import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';
import { withAuth, withRateLimit } from '../../../lib/security';
import { z } from 'zod';

const createOrderSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  customerCity: z.string().optional(),
  customerProvince: z.string().optional(),
  customerPostalCode: z.string().optional(),
  deviceModelId: z.union([z.string(), z.number()]),
  deviceConditionId: z.union([z.string(), z.number()]),
  storageOptionId: z.union([z.string(), z.number()]),
  quotedAmount: z.union([z.string(), z.number()]),
  paymentMethod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data: orders, error } = await supabaseAdmin
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
        .order('createdAt', { ascending: false });

      if (error) throw error;

      res.status(200).json({ orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else if (req.method === 'POST') {
    try {
    const {
      customerEmail,
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerProvince,
      customerPostalCode,
      deviceModelId,
      deviceConditionId,
      storageOptionId,
      quotedAmount,
      paymentMethod,
      notes
    } = createOrderSchema.parse(req.body);

      // Validate required fields
      if (!customerEmail || !customerName || !deviceModelId || !deviceConditionId || !storageOptionId || !quotedAmount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Find or create customer
      let customer;
      const { data: existingCustomer, error: customerError } = await supabaseAdmin
        .from('Customer')
        .select('*')
        .eq('email', customerEmail)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        throw customerError;
      }

      if (!existingCustomer) {
        const { data: newCustomer, error: createError } = await supabaseAdmin
          .from('Customer')
          .insert({
            email: customerEmail,
            firstName: customerName.split(' ')[0] || customerName,
            lastName: customerName.split(' ').slice(1).join(' ') || '',
            phone: customerPhone,
            addressLine1: customerAddress,
            city: customerCity,
            province: customerProvince,
            postalCode: customerPostalCode,
            passwordHash: 'temp-hash', // Will be updated when customer registers
          })
          .select()
          .single();

        if (createError) throw createError;
        customer = newCustomer;
      } else {
        // Update existing customer with address information
        const { data: updatedCustomer, error: updateError } = await supabaseAdmin
          .from('Customer')
          .update({
            addressLine1: customerAddress,
            city: customerCity,
            province: customerProvince,
            postalCode: customerPostalCode,
          })
          .eq('id', existingCustomer.id)
          .select()
          .single();

        if (updateError) throw updateError;
        customer = updatedCustomer;
      }

      // Generate unique order number
      const currentYear = new Date().getFullYear();
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const orderNumber = `TI-${currentYear}-${timestamp}-${randomSuffix}`;

      // Create trade-in order
      const { data: tradeInOrder, error: orderError } = await supabaseAdmin
        .from('TradeInOrder')
        .insert({
          orderNumber,
          customerId: customer.id,
          deviceModelId: parseInt(String(deviceModelId)),
          deviceConditionId: parseInt(String(deviceConditionId)),
          storageOptionId: parseInt(String(storageOptionId)),
          quotedAmount: parseFloat(String(quotedAmount)),
          status: 'PENDING',
          paymentMethod: paymentMethod || null,
          notes: notes || '',
        })
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

      if (orderError) throw orderError;

      // Create initial status history
      const { error: historyError } = await supabaseAdmin
        .from('OrderStatusHistory')
        .insert({
          orderId: tradeInOrder.id,
          status: 'PENDING',
          notes: 'Order created from staff dashboard',
          updatedBy: 1, // Default to first staff member
        });

      if (historyError) throw historyError;

      res.status(201).json({
        success: true,
        order: tradeInOrder,
        message: 'Order created successfully'
      });

    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { orderId, status, finalAmount, notes } = req.body;

      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (finalAmount !== undefined) {
        updateData.finalAmount = finalAmount;
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
          updatedBy: 1, // Default staff member
        });

      res.status(200).json({ order });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { orderId } = req.body;

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
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(['staff'])(withRateLimit({ windowMs: 60_000, limit: 60, keyPrefix: 'staff:' })(handler));