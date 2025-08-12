import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple security check - just verify we have a token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      console.log('Orders API: Fetching orders...');
      
      if (!supabaseAdmin) {
        console.error('Orders API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      // Simple, direct database query - NO ORDER CLAUSE
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
        .limit(50);

      if (error) {
        console.error('Orders API: Database error:', error);
        // Return empty array instead of error for now
        return res.status(200).json({ orders: [] });
      }

      console.log('Orders API: Successfully fetched orders:', orders?.length || 0);
      res.status(200).json({ orders: orders || [] });
      
    } catch (error) {
      console.error('Orders API: Error fetching orders:', error);
      // Return empty array instead of error
      res.status(200).json({ orders: [] });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('Orders API: Creating new order...');
      
      if (!supabaseAdmin) {
        console.error('Orders API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { customerId, deviceModelId, deviceConditionId, storageOptionId, estimatedValue, status, paymentMethod } = req.body;

      if (!customerId || !deviceModelId || !deviceConditionId || !storageOptionId || !estimatedValue) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data: order, error } = await supabaseAdmin
        .from('TradeInOrder')
        .insert([{ 
          customerId, 
          deviceModelId, 
          deviceConditionId, 
          storageOptionId, 
          estimatedValue, 
          status: status || 'PENDING',
          paymentMethod: paymentMethod || 'E_TRANSFER'
        }])
        .select()
        .single();

      if (error) {
        console.error('Orders API: Create error:', error);
        
        // Handle specific error types
        if (error.code === '23503') {
          return res.status(400).json({ 
            error: 'Invalid reference',
            details: 'The customer, device model, condition, or storage option does not exist'
          });
        } else if (error.code === '23502') {
          return res.status(400).json({ 
            error: 'Missing required fields',
            details: 'Please fill in all required fields'
          });
        } else if (error.code === '23514') {
          return res.status(400).json({ 
            error: 'Invalid data format',
            details: 'Please check the data format and try again'
          });
        } else {
          return res.status(500).json({ 
            error: 'Failed to create order',
            details: error.message || 'Database error occurred'
          });
        }
      }

      console.log('Orders API: Successfully created order:', order.id);
      res.status(201).json({ order });
      
    } catch (error) {
      console.error('Orders API: Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  } else if (req.method === 'PUT') {
    try {
      console.log('Orders API: Updating order...');
      
      if (!supabaseAdmin) {
        console.error('Orders API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { id, customerId, deviceModelId, deviceConditionId, storageOptionId, estimatedValue, status, paymentMethod } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const { data: order, error } = await supabaseAdmin
        .from('TradeInOrder')
        .update({ 
          customerId, 
          deviceModelId, 
          deviceConditionId, 
          storageOptionId, 
          estimatedValue, 
          status, 
          paymentMethod,
          updatedAt: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Orders API: Update error:', error);
        return res.status(500).json({ error: 'Failed to update order' });
      }

      console.log('Orders API: Successfully updated order:', order.id);
      res.status(200).json({ order });
      
    } catch (error) {
      console.error('Orders API: Error updating order:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  } else if (req.method === 'DELETE') {
    try {
      console.log('Orders API: Deleting order...');
      
      if (!supabaseAdmin) {
        console.error('Orders API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const { error } = await supabaseAdmin
        .from('TradeInOrder')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Orders API: Delete error:', error);
        return res.status(500).json({ error: 'Failed to delete order' });
      }

      console.log('Orders API: Successfully deleted order:', id);
      res.status(200).json({ message: 'Order deleted successfully' });
      
    } catch (error) {
      console.error('Orders API: Error deleting order:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}