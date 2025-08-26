import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const testData = {
        customerEmail: 'test@example.com',
        customerFirstName: 'Test',
        customerLastName: 'User',
        customerPhone: '123-456-7890',
        deviceModelId: 1,
        deviceConditionId: 1,
        storageOptionId: 1,
        estimatedValue: 100.00
      };

      console.log('Test Trade-in: Testing with data:', testData);

      // Test 1: Check if Customer table exists and can be queried
      console.log('Test Trade-in: Testing Customer table...');
      const { data: customers, error: customerError } = await supabaseAdmin
        .from('Customer')
        .select('*')
        .limit(1);

      if (customerError) {
        console.log('Test Trade-in: Customer table error:', customerError);
        return res.status(500).json({ 
          error: 'Customer table error', 
          details: customerError,
          step: 'Customer table check'
        });
      }
      console.log('Test Trade-in: Customer table OK, found:', customers?.length || 0, 'customers');

      // Test 2: Check if DeviceModel table exists and can be queried
      console.log('Test Trade-in: Testing DeviceModel table...');
      const { data: models, error: modelError } = await supabaseAdmin
        .from('DeviceModel')
        .select('*')
        .limit(1);

      if (modelError) {
        console.log('Test Trade-in: DeviceModel table error:', modelError);
        return res.status(500).json({ 
          error: 'DeviceModel table error', 
          details: modelError,
          step: 'DeviceModel table check'
        });
      }
      console.log('Test Trade-in: DeviceModel table OK, found:', models?.length || 0, 'models');

      // Test 3: Check if DeviceCondition table exists and can be queried
      console.log('Test Trade-in: Testing DeviceCondition table...');
      const { data: conditions, error: conditionError } = await supabaseAdmin
        .from('DeviceCondition')
        .select('*')
        .limit(1);

      if (conditionError) {
        console.log('Test Trade-in: DeviceCondition table error:', conditionError);
        return res.status(500).json({ 
          error: 'DeviceCondition table error', 
          details: conditionError,
          step: 'DeviceCondition table check'
        });
      }
      console.log('Test Trade-in: DeviceCondition table OK, found:', conditions?.length || 0, 'conditions');

      // Test 4: Check if DeviceStorageOption table exists and can be queried
      console.log('Test Trade-in: Testing DeviceStorageOption table...');
      const { data: storageOptions, error: storageError } = await supabaseAdmin
        .from('DeviceStorageOption')
        .select('*')
        .limit(1);

      if (storageError) {
        console.log('Test Trade-in: DeviceStorageOption table error:', storageError);
        return res.status(500).json({ 
          error: 'DeviceStorageOption table error', 
          details: storageError,
          step: 'DeviceStorageOption table check'
        });
      }
      console.log('Test Trade-in: DeviceStorageOption table OK, found:', storageOptions?.length || 0, 'storage options');

      // Test 5: Check if TradeInOrder table exists and can be queried
      console.log('Test Trade-in: Testing TradeInOrder table...');
      const { data: orders, error: orderError } = await supabaseAdmin
        .from('TradeInOrder')
        .select('*')
        .limit(1);

      if (orderError) {
        console.log('Test Trade-in: TradeInOrder table error:', orderError);
        return res.status(500).json({ 
          error: 'TradeInOrder table error', 
          details: orderError,
          step: 'TradeInOrder table check'
        });
      }
      console.log('Test Trade-in: TradeInOrder table OK, found:', orders?.length || 0, 'orders');

      // Test 6: Check if OrderStatusHistory table exists and can be queried
      console.log('Test Trade-in: Testing OrderStatusHistory table...');
      const { data: statusHistory, error: statusError } = await supabaseAdmin
        .from('OrderStatusHistory')
        .select('*')
        .limit(1);

      if (statusError) {
        console.log('Test Trade-in: OrderStatusHistory table error:', statusError);
        return res.status(500).json({ 
          error: 'OrderStatusHistory table error', 
          details: statusError,
          step: 'OrderStatusHistory table check'
        });
      }
      console.log('Test Trade-in: OrderStatusHistory table OK, found:', statusHistory?.length || 0, 'status history entries');

      // Test 7: Try to create a test customer
      console.log('Test Trade-in: Testing customer creation...');
      const { data: testCustomer, error: createCustomerError } = await supabaseAdmin
        .from('Customer')
        .insert({
          email: 'test-trade-in@example.com',
          firstName: 'Test',
          lastName: 'TradeIn',
          phone: '123-456-7890'
        })
        .select()
        .single();

      if (createCustomerError) {
        console.log('Test Trade-in: Customer creation error:', createCustomerError);
        return res.status(500).json({ 
          error: 'Customer creation failed', 
          details: createCustomerError,
          step: 'Customer creation test'
        });
      }
      console.log('Test Trade-in: Customer creation OK, created customer ID:', testCustomer.id);

      // Test 8: Try to create a test order
      console.log('Test Trade-in: Testing order creation...');
      const orderNumber = `TEST-${Date.now()}`;
      const { data: testOrder, error: createOrderError } = await supabaseAdmin
        .from('TradeInOrder')
        .insert({
          orderNumber: orderNumber,
          customerId: testCustomer.id,
          deviceModelId: testData.deviceModelId,
          deviceConditionId: testData.deviceConditionId,
          storageOptionId: testData.storageOptionId,
          quotedAmount: testData.estimatedValue,
          status: 'PENDING',
          paymentMethod: 'E_TRANSFER'
        })
        .select()
        .single();

      if (createOrderError) {
        console.log('Test Trade-in: Order creation error:', createOrderError);
        return res.status(500).json({ 
          error: 'Order creation failed', 
          details: createOrderError,
          step: 'Order creation test'
        });
      }
      console.log('Test Trade-in: Order creation OK, created order ID:', testOrder.id);

      // Test 9: Try to create status history
      console.log('Test Trade-in: Testing status history creation...');
      const { data: testStatus, error: createStatusError } = await supabaseAdmin
        .from('order_status_history')
        .insert({
          order_id: testOrder.id,
          status: 'PENDING',
          notes: 'Test trade-in order submitted',
          updated_by: 1
        })
        .select()
        .single();

      if (createStatusError) {
        console.log('Test Trade-in: Status history creation error:', createStatusError);
        return res.status(500).json({ 
          error: 'Status history creation failed', 
          details: createStatusError,
          step: 'Status history creation test'
        });
      }
      console.log('Test Trade-in: Status history creation OK, created status ID:', testStatus.id);

      // Clean up test data
      console.log('Test Trade-in: Cleaning up test data...');
      await supabaseAdmin.from('OrderStatusHistory').delete().eq('id', testStatus.id);
      await supabaseAdmin.from('TradeInOrder').delete().eq('id', testOrder.id);
      await supabaseAdmin.from('Customer').delete().eq('id', testCustomer.id);
      console.log('Test Trade-in: Test data cleaned up');

      return res.status(200).json({
        success: true,
        message: 'All trade-in tests passed successfully',
        tests: [
          'Customer table check',
          'DeviceModel table check',
          'DeviceCondition table check',
          'DeviceStorageOption table check',
          'trade_in_orders table check',
          'order_status_history table check',
          'Customer creation test',
          'Order creation test',
          'Status history creation test'
        ],
        summary: 'Database is ready for trade-in submissions'
      });

    } catch (error) {
      console.error('Test Trade-in: Error:', error);
      return res.status(500).json({ 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
