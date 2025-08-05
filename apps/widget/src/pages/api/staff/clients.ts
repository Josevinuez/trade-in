import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data: clients, error } = await supabaseAdmin
        .from('Customer')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;

      res.status(200).json({ clients });
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        addressLine1,
        city,
        province,
        postalCode
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if customer already exists
      const { data: existingCustomer, error: checkError } = await supabaseAdmin
        .from('Customer')
        .select('*')
        .eq('email', email)
        .single();

      if (existingCustomer) {
        return res.status(400).json({ error: 'Customer with this email already exists' });
      }

      // Create new customer
      const { data: customer, error: createError } = await supabaseAdmin
        .from('Customer')
        .insert({
          firstName,
          lastName,
          email,
          phone: phone || null,
          addressLine1: addressLine1 || null,
          city: city || null,
          province: province || null,
          postalCode: postalCode || null,
          passwordHash: 'temp-hash', // Will be updated when customer registers
        })
        .select()
        .single();

      if (createError) throw createError;

      res.status(201).json({
        success: true,
        customer,
        message: 'Customer created successfully'
      });

    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ error: 'Failed to create customer' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, firstName, lastName, email, phone, addressLine1, city, province, postalCode } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }

      // Check if email is being changed and if it already exists
      if (email) {
        const { data: existingCustomer, error: checkError } = await supabaseAdmin
          .from('Customer')
          .select('*')
          .eq('email', email)
          .neq('id', id)
          .single();

        if (existingCustomer) {
          return res.status(400).json({ error: 'Email already exists for another customer' });
        }
      }

      // Update customer
      const { data: customer, error: updateError } = await supabaseAdmin
        .from('Customer')
        .update({
          firstName: firstName || null,
          lastName: lastName || null,
          email: email || null,
          phone: phone || null,
          addressLine1: addressLine1 || null,
          city: city || null,
          province: province || null,
          postalCode: postalCode || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      res.status(200).json({
        success: true,
        customer,
        message: 'Customer updated successfully'
      });

    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({ error: 'Failed to update customer' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }

      // Check if customer has orders
      const { data: orders, error: ordersError } = await supabaseAdmin
        .from('TradeInOrder')
        .select('id')
        .eq('customerId', id);

      if (ordersError) throw ordersError;

      if (orders && orders.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete customer with existing orders',
          message: 'This customer has associated trade-in orders and cannot be deleted.'
        });
      }

      // Delete customer
      const { error: deleteError } = await supabaseAdmin
        .from('Customer')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({ error: 'Failed to delete customer' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 