import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';
import { withRateLimit } from '../../../lib/security';
import { z } from 'zod';

const submitSchema = z.object({
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    } = submitSchema.parse(req.body);

    // Validate required fields
    if (!customerEmail || !customerName || !deviceModelId || !deviceConditionId || !storageOptionId || !quotedAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if customer exists, if not create them
    let { data: customer, error: customerError } = await supabaseAdmin
      .from('Customer')
      .select('*')
      .eq('email', customerEmail)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      throw customerError;
    }

    if (!customer) {
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
        .eq('id', customer.id)
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
        notes: 'Order created from trade-in form',
        updatedBy: 1, // Default to first staff member
      });

    if (historyError) throw historyError;

    res.status(201).json({
      success: true,
      order: tradeInOrder,
      orderNumber: orderNumber,
      message: 'Trade-in order submitted successfully'
    });

  } catch (error) {
    console.error('Trade-in submission error:', error);
    res.status(500).json({ error: 'Failed to submit trade-in order' });
  }
}

export default withRateLimit({ windowMs: 60_000, limit: 30, keyPrefix: 'submit:' })(handler);