import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    if (!supabaseAdmin) {
      console.error('Trade-in Submit API: supabaseAdmin not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const {
      customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone,
      customerAddress,
      customerCity,
      customerProvince,
      customerPostalCode,
      deviceModelId,
      deviceConditionId,
      storageOptionId,
      estimatedValue
    } = req.body;

    // Log all received values for debugging
    console.log('Trade-in Submit API: Received data:', {
      customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone,
      customerAddress,
      customerCity,
      customerProvince,
      customerPostalCode,
      deviceModelId,
      deviceConditionId,
      storageOptionId,
      estimatedValue,
      bodyKeys: Object.keys(req.body),
      bodyValues: Object.values(req.body)
    });

    // Validate required fields
    if (!customerEmail || !customerFirstName || !customerLastName || !deviceModelId || !deviceConditionId || !storageOptionId || !estimatedValue) {
      const missingFields = [];
      if (!customerEmail) missingFields.push('customerEmail');
      if (!customerFirstName) missingFields.push('customerFirstName');
      if (!customerLastName) missingFields.push('customerLastName');
      if (!deviceModelId) missingFields.push('deviceModelId');
      if (!deviceConditionId) missingFields.push('deviceConditionId');
      if (!storageOptionId) missingFields.push('storageOptionId');
      if (!estimatedValue) missingFields.push('estimatedValue');
      
      console.log('Trade-in Submit API: Missing fields:', missingFields);
      
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: `Missing fields: ${missingFields.join(', ')}`,
        receivedData: {
          customerEmail: !!customerEmail,
          customerFirstName: !!customerFirstName,
          customerLastName: !!customerLastName,
          deviceModelId: !!deviceModelId,
          deviceConditionId: !!deviceConditionId,
          storageOptionId: !!storageOptionId,
          estimatedValue: !!estimatedValue
        }
      });
    }
    
    // Log address information (optional fields)
    console.log('Trade-in Submit API: Address information received:', {
      address: customerAddress || 'Not provided',
      city: customerCity || 'Not provided',
      province: customerProvince || 'Not provided',
      postalCode: customerPostalCode || 'Not provided'
    });

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    // Check if customer exists, if not create them
    let { data: customer, error: customerError } = await supabaseAdmin
      .from('Customer')
      .select('*')
      .eq('email', customerEmail)
      .single();

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('Trade-in Submit API: Customer lookup error:', customerError);
      return res.status(500).json({ 
        error: 'Failed to check customer',
        details: 'Database error occurred while checking customer'
      });
    }

    let customerId: number;

    if (!customer) {
      // Create new customer
      const { data: newCustomer, error: createError } = await supabaseAdmin
        .from('Customer')
        .insert({
          email: customerEmail,
          firstName: customerFirstName,
          lastName: customerLastName,
          phone: customerPhone || null,
          addressLine1: customerAddress || null,
          city: customerCity || null,
          province: customerProvince || null,
          postalCode: customerPostalCode || null
        })
        .select()
        .single();

      if (createError) {
        console.error('Trade-in Submit API: Customer creation error:', createError);
        return res.status(500).json({ 
          error: 'Failed to create customer',
          details: createError.message || 'Database error occurred'
        });
      }

      customerId = newCustomer.id;
      console.log('Trade-in Submit API: Created new customer:', customerId, 'with address:', {
        address: customerAddress,
        city: customerCity,
        province: customerProvince,
        postalCode: customerPostalCode
      });
    } else {
      customerId = customer.id;
      console.log('Trade-in Submit API: Using existing customer:', customerId);
      
      // Update existing customer with new address information if provided
      if (customerAddress || customerCity || customerProvince || customerPostalCode) {
        const updateData: any = {};
        if (customerAddress) updateData.addressLine1 = customerAddress;
        if (customerCity) updateData.city = customerCity;
        if (customerProvince) updateData.province = customerProvince;
        if (customerPostalCode) updateData.postalCode = customerPostalCode;
        
        console.log('Trade-in Submit API: Updating existing customer with new address info:', updateData);
        
        const { error: updateError } = await supabaseAdmin
          .from('Customer')
          .update(updateData)
          .eq('id', customerId);
          
        if (updateError) {
          console.error('Trade-in Submit API: Customer update error:', updateError);
          // Don't fail the whole request for address update errors
        } else {
          console.log('Trade-in Submit API: Customer address updated successfully');
        }
      }
    }

    // Generate order number
    const orderNumber = `TI-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Create trade-in order using correct PascalCase table and column names
    const { data: order, error: orderError } = await supabaseAdmin
      .from('TradeInOrder')
      .insert({
        orderNumber: orderNumber,
        customerId: customerId,
        deviceModelId: parseInt(deviceModelId),
        deviceConditionId: parseInt(deviceConditionId),
        storageOptionId: parseInt(storageOptionId),
        quotedAmount: parseFloat(estimatedValue),
        status: 'PENDING',
        paymentMethod: 'E_TRANSFER'
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

    if (orderError) {
      console.error('Trade-in Submit API: Order creation error:', orderError);
      return res.status(500).json({ 
        error: 'Failed to create order',
        details: orderError.message || 'Database error occurred'
      });
    }

    // Create initial status history entry
    await supabaseAdmin
      .from('OrderStatusHistory')
      .insert({
        orderId: order.id,
        status: 'PENDING',
        notes: 'Trade-in order submitted',
        updatedBy: 1 // System user
      });

    console.log('Trade-in Submit API: Successfully created order:', order.id);
    res.status(201).json({
      success: true,
      message: 'Trade-in order submitted successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedValue: order.estimatedValue,
        submittedAt: order.submittedAt,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        deviceModel: `${order.deviceModel.brand.name} ${order.deviceModel.name}`,
        deviceCondition: order.deviceCondition.name,
        storageOption: order.storageOption.storage
      }
    });

  } catch (error) {
    console.error('Trade-in Submit API: Error:', error);
    res.status(500).json({ 
      error: 'Failed to submit trade-in',
      details: 'An unexpected error occurred. Please try again.'
    });
  }
}