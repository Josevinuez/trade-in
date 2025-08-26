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

    // First, find the order by order number
    console.log('Trade-in Track API: Searching for order with orderNumber:', orderNumber);
    
    // Try different table names in case there's a mismatch
    let orderBasic: any = null;
    let orderBasicError: any = null;
    
    // Try 'TradeInOrder' first
    const tradeInOrderResult = await supabaseAdmin
      .from('TradeInOrder')
      .select('*')
      .eq('orderNumber', orderNumber)
      .single();
      
    if (tradeInOrderResult.data) {
      orderBasic = tradeInOrderResult.data;
      console.log('Trade-in Track API: Found order in TradeInOrder table');
    } else if (tradeInOrderResult.error) {
      console.log('Trade-in Track API: TradeInOrder table error:', tradeInOrderResult.error);
      
      // Try 'trade_in_orders' as fallback
      const tradeInOrdersResult = await supabaseAdmin
        .from('trade_in_orders')
        .select('*')
        .eq('orderNumber', orderNumber)
        .single();
        
      if (tradeInOrdersResult.data) {
        orderBasic = tradeInOrdersResult.data;
        console.log('Trade-in Track API: Found order in trade_in_orders table');
      } else {
        orderBasicError = tradeInOrdersResult.error;
        console.log('Trade-in Track API: trade_in_orders table error:', tradeInOrdersResult.error);
      }
    }
      
    if (orderBasicError || !orderBasic) {
      console.error('Trade-in Track API: Basic order lookup error:', orderBasicError);
      return res.status(404).json({ 
        error: 'Order not found',
        details: 'No order found with the provided order number',
        debug: { orderNumber }
      });
    }
    
    console.log('Trade-in Track API: Found basic order:', orderBasic);
    
    // Now get the customer to verify email
    let customer: any = null;
    let customerError: any = null;
    
    const customerResult = await supabaseAdmin
      .from('Customer')
      .select('*')
      .eq('id', orderBasic.customerId)
      .single();
      
    if (customerResult.data) {
      customer = customerResult.data;
      console.log('Trade-in Track API: Found customer in Customer table');
    } else if (customerResult.error) {
      console.log('Trade-in Track API: Customer table error:', customerResult.error);
      
      // Try 'customers' as fallback
      const customersResult = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('id', orderBasic.customerId)
        .single();
        
      if (customersResult.data) {
        customer = customersResult.data;
        console.log('Trade-in Track API: Found customer in customers table');
      } else {
        customerError = customersResult.error;
        console.log('Trade-in Track API: customers table error:', customersResult.error);
      }
    }
      
    if (customerError || !customer) {
      console.error('Trade-in Track API: Customer lookup error:', customerError);
      return res.status(404).json({ 
        error: 'Customer not found',
        details: 'Customer associated with this order could not be found'
      });
    }
    
    console.log('Trade-in Track API: Found customer:', customer);
    
    // Verify email matches
    if (customer.email !== email) {
      console.error('Trade-in Track API: Email mismatch:', { 
        providedEmail: email, 
        customerEmail: customer.email 
      });
      return res.status(403).json({ 
        error: 'Access denied',
        details: 'This order does not belong to the specified email'
      });
    }
    
    // Now get the related data
    console.log('Trade-in Track API: Looking up related data with IDs:', {
      deviceModelId: orderBasic.deviceModelId,
      deviceConditionId: orderBasic.deviceConditionId,
      storageOptionId: orderBasic.storageOptionId
    });
    
    let deviceModelData: any = null;
    let deviceModelError: any = null;
    
    const deviceModelResult = await supabaseAdmin
      .from('DeviceModel')
      .select(`
        *,
        brand:DeviceBrand(*),
        category:DeviceCategory(*)
      `)
      .eq('id', orderBasic.deviceModelId)
      .single();
      
    if (deviceModelResult.data) {
      deviceModelData = deviceModelResult.data;
      console.log('Trade-in Track API: Found device model in DeviceModel table');
    } else if (deviceModelResult.error) {
      console.log('Trade-in Track API: DeviceModel table error:', deviceModelResult.error);
      
      // Try 'device_models' as fallback
      const deviceModelsResult = await supabaseAdmin
        .from('device_models')
        .select(`
          *,
          brand:device_brands(*),
          category:device_categories(*)
        `)
        .eq('id', orderBasic.deviceModelId)
        .single();
        
      if (deviceModelsResult.data) {
        deviceModelData = deviceModelsResult.data;
        console.log('Trade-in Track API: Found device model in device_models table');
      } else {
        deviceModelError = deviceModelsResult.error;
        console.log('Trade-in Track API: device_models table error:', deviceModelsResult.error);
      }
    }
      
    const { data: deviceConditionData, error: deviceConditionError } = await supabaseAdmin
      .from('DeviceCondition')
      .select('*')
      .eq('id', orderBasic.deviceConditionId)
      .single();
      
    const { data: storageOptionData, error: storageOptionError } = await supabaseAdmin
      .from('DeviceStorageOption')
      .select('*')
      .eq('id', orderBasic.storageOptionId)
      .single();
      
    // Log any errors but continue
    if (deviceModelError) {
      console.error('Trade-in Track API: Device model lookup error:', deviceModelError);
      console.error('Trade-in Track API: Device model ID:', orderBasic.deviceModelId);
    }
    if (deviceConditionError) {
      console.error('Trade-in Track API: Device condition lookup error:', deviceConditionError);
      console.error('Trade-in Track API: Device condition ID:', orderBasic.deviceConditionId);
    }
    if (storageOptionError) {
      console.error('Trade-in Track API: Storage option lookup error:', storageOptionError);
      console.error('Trade-in Track API: Storage option ID:', orderBasic.storageOptionId);
    }
    
    // Log the retrieved data
    console.log('Trade-in Track API: Retrieved related data:', {
      deviceModel: deviceModelData,
      deviceCondition: deviceConditionData,
      storageOption: storageOptionData
    });
    
    // Combine all the data
    const order = {
      ...orderBasic,
      customer,
      deviceModel: deviceModelData,
      deviceCondition: deviceConditionData,
      storageOption: storageOptionData
    };



    // Get status history
    const { data: statusHistory, error: historyError } = await supabaseAdmin
      .from('OrderStatusHistory')
      .select('*')
      .eq('orderId', orderBasic.id)
      .order('createdAt', { ascending: true });

    if (historyError) {
      console.error('Trade-in Track API: Status history error:', historyError);
      // Continue without status history
    }

    // Ensure status is always present with a default value
    const orderStatus = order.status || 'PENDING';
    
    console.log('Trade-in Track API: Successfully retrieved order:', orderBasic.id, 'with status:', orderStatus);
    console.log('Trade-in Track API: Full order data:', order);
    console.log('Trade-in Track API: Customer data:', order.customer);
    console.log('Trade-in Track API: Device model data:', order.deviceModel);
    console.log('Trade-in Track API: Device condition data:', order.deviceCondition);
    console.log('Trade-in Track API: Storage option data:', order.storageOption);
    
    // Safely extract data with fallbacks
    const customerName = order.customer?.firstName && order.customer?.lastName 
      ? `${order.customer.firstName} ${order.customer.lastName}`
      : 'N/A';
      
    const deviceModel = order.deviceModel?.brand?.name && order.deviceModel?.name
      ? `${order.deviceModel.brand.name} ${order.deviceModel.name}`
      : 'N/A';
      
    const deviceCondition = order.deviceCondition?.name || 'Unknown';
    const storageOption = order.storageOption?.storage || 'Unknown';
    
    // Additional debugging for empty data issues
    console.log('Trade-in Track API: Extracted data:', {
      customerName,
      deviceModel,
      deviceCondition,
      storageOption,
      estimatedValue: orderBasic.quotedAmount || orderBasic.estimatedValue || 0,
      finalAmount: orderBasic.finalAmount,
      status: orderStatus
    });
    
    // Check for missing data and log warnings
    if (customerName === 'N/A') {
      console.warn('Trade-in Track API: Customer name is N/A - customer data might be missing');
    }
    if (deviceModel === 'N/A') {
      console.warn('Trade-in Track API: Device model is N/A - device model data might be missing');
    }
    if (deviceCondition === 'Unknown') {
      console.warn('Trade-in Track API: Device condition is Unknown - condition data might be missing');
    }
    
    res.status(200).json({
      success: true,
      order: {
        id: orderBasic.id,
        orderNumber: orderBasic.orderNumber,
        status: orderStatus,
        estimatedValue: orderBasic.quotedAmount || orderBasic.estimatedValue || 0,
        finalAmount: orderBasic.finalAmount,
        submittedAt: orderBasic.submittedAt,
        processedAt: orderBasic.processedAt,
        completedAt: orderBasic.completedAt,
        customerName: customerName,
        deviceModel: deviceModel,
        deviceCondition: deviceCondition,
        storageOption: storageOption,
        notes: orderBasic.notes,
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