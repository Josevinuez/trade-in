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
      console.log('Clients API: Fetching clients...');
      
      if (!supabaseAdmin) {
        console.error('Clients API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      // Simple, direct database query - NO ORDER CLAUSE
      const { data: clients, error } = await supabaseAdmin
        .from('Customer')
        .select('*')
        .limit(50);

      if (error) {
        console.error('Clients API: Database error:', error);
        // Return empty array instead of error for now
        return res.status(200).json({ clients: [] });
      }

      // Log the actual data structure
      console.log('Clients API: Raw database response:', clients);
      if (clients && clients.length > 0) {
        console.log('Clients API: First client structure:', clients[0]);
        console.log('Clients API: First client keys:', Object.keys(clients[0]));
      }

      console.log('Clients API: Successfully fetched clients:', clients?.length || 0);
      res.status(200).json({ clients: clients || [] });
      
    } catch (error) {
      console.error('Clients API: Error fetching clients:', error);
      // Return empty array instead of error
      res.status(200).json({ clients: [] });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('Clients API: Creating new client...');
      
      if (!supabaseAdmin) {
        console.error('Clients API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { firstName, lastName, email, phone } = req.body;

      // Enhanced validation
      if (!firstName || !lastName || !email) {
        const missingFields = [];
        if (!firstName) missingFields.push('first name');
        if (!lastName) missingFields.push('last name');
        if (!email) missingFields.push('email');
        
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: `Please provide: ${missingFields.join(', ')}`,
          missingFields
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

      const { data: client, error } = await supabaseAdmin
        .from('Customer')
        .insert([{ firstName, lastName, email, phone }])
        .select()
        .single();

      if (error) {
        console.error('Clients API: Create error:', error);
        
        // Handle specific error types with better messages
        if (error.code === '23505') {
          return res.status(409).json({ 
            error: 'Client with this email already exists',
            details: 'A customer with this email address is already registered. Please use a different email or update the existing client.',
            suggestion: 'Try using a different email address or search for the existing client'
          });
        } else if (error.code === '23502') {
          return res.status(400).json({ 
            error: 'Missing required fields',
            details: 'Please fill in all required fields',
            requiredFields: ['firstName', 'lastName', 'email']
          });
        } else if (error.code === '23514') {
          return res.status(400).json({ 
            error: 'Invalid data format',
            details: 'Please check the data format and try again',
            suggestion: 'Ensure all fields contain valid data'
          });
        } else if (error.code === '22P02') {
          return res.status(400).json({ 
            error: 'Invalid data type',
            details: 'One or more fields contain invalid data types',
            suggestion: 'Check that all fields contain the correct data types'
          });
        } else {
          return res.status(500).json({ 
            error: 'Failed to create client',
            details: error.message || 'Database error occurred',
            code: error.code,
            suggestion: 'Please try again or contact support if the problem persists'
          });
        }
      }

      console.log('Clients API: Successfully created client:', client.id);
      res.status(201).json({ client });
      
    } catch (error) {
      console.error('Clients API: Error creating client:', error);
      res.status(500).json({ 
        error: 'Failed to create client',
        details: 'An unexpected error occurred. Please try again.',
        suggestion: 'If the problem persists, please contact support'
      });
    }
  } else if (req.method === 'PUT') {
    try {
      console.log('Clients API: Updating client...');
      
      if (!supabaseAdmin) {
        console.error('Clients API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { id, firstName, lastName, email, phone } = req.body;

      // Enhanced validation
      if (!id) {
        return res.status(400).json({ 
          error: 'Client ID is required',
          details: 'Please provide the client ID to update',
          suggestion: 'Make sure you are editing an existing client'
        });
      }

      if (!firstName || !lastName || !email) {
        const missingFields = [];
        if (!firstName) missingFields.push('first name');
        if (!lastName) missingFields.push('last name');
        if (!email) missingFields.push('email');
        
        return res.status(400).json({ 
          error: 'Missing required fields',
          details: `Please provide: ${missingFields.join(', ')}`,
          missingFields
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

      const { data: client, error } = await supabaseAdmin
        .from('Customer')
        .update({ firstName, lastName, email, phone, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Clients API: Update error:', error);
        
        // Handle specific error types with better messages
        if (error.code === '23505') {
          return res.status(409).json({ 
            error: 'Client with this email already exists',
            details: 'A customer with this email address is already registered. Please use a different email.',
            suggestion: 'Try using a different email address or check if another client already uses this email'
          });
        } else if (error.code === '23502') {
          return res.status(400).json({ 
            error: 'Missing required fields',
            details: 'Please fill in all required fields',
            requiredFields: ['firstName', 'lastName', 'email']
          });
        } else if (error.code === '23514') {
          return res.status(400).json({ 
            error: 'Invalid data format',
            details: 'Please check the data format and try again',
            suggestion: 'Ensure all fields contain valid data'
          });
        } else if (error.code === '22P02') {
          return res.status(400).json({ 
            error: 'Invalid data type',
            details: 'One or more fields contain invalid data types',
            suggestion: 'Check that all fields contain the correct data types'
          });
        } else if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Client not found',
            details: 'The client you are trying to update does not exist',
            suggestion: 'Check the client ID or refresh the client list'
          });
        } else {
          return res.status(500).json({ 
            error: 'Failed to update client',
            details: error.message || 'Database error occurred',
            code: error.code,
            suggestion: 'Please try again or contact support if the problem persists'
          });
        }
      }

      console.log('Clients API: Successfully updated client:', client.id);
      res.status(200).json({ client });
      
    } catch (error) {
      console.error('Clients API: Error updating client:', error);
      res.status(500).json({ 
        error: 'Failed to update client',
        details: 'An unexpected error occurred. Please try again.',
        suggestion: 'If the problem persists, please contact support'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      console.log('Clients API: Deleting client...');
      console.log('Clients API: Request body:', req.body);
      
      if (!supabaseAdmin) {
        console.error('Clients API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { id } = req.body;
      console.log('Clients API: Client ID to delete:', id);

      if (!id) {
        console.error('Clients API: No ID provided in request body');
        return res.status(400).json({ 
          error: 'Client ID is required',
          details: 'Please provide the client ID to delete',
          suggestion: 'Make sure you are deleting an existing client'
        });
      }

      console.log('Clients API: Attempting to delete client with ID:', id);
      
      // Check if client has any orders (foreign key constraint)
      const { data: existingOrders, error: checkError } = await supabaseAdmin
        .from('TradeInOrder')
        .select('id, orderNumber, status')
        .eq('customerId', id)
        .limit(5);

      if (checkError) {
        console.error('Clients API: Error checking for existing orders:', checkError);
        return res.status(500).json({ 
          error: 'Failed to check client dependencies',
          details: checkError.message || 'Database error occurred',
          suggestion: 'Please try again or contact support'
        });
      }

      if (existingOrders && existingOrders.length > 0) {
        const orderDetails = existingOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber || `Order #${order.id}`,
          status: order.status
        }));
        
        console.error('Clients API: Cannot delete client with existing orders');
        return res.status(400).json({ 
          error: 'Cannot delete client',
          details: `This client has ${existingOrders.length} existing order(s) and cannot be deleted`,
          orderCount: existingOrders.length,
          orders: orderDetails,
          suggestion: 'Delete or reassign the orders first, then try deleting the client again'
        });
      }

      // Check if client exists before attempting deletion
      const { data: existingClient, error: clientCheckError } = await supabaseAdmin
        .from('Customer')
        .select('id, firstName, lastName, email')
        .eq('id', id)
        .single();

      if (clientCheckError) {
        if (clientCheckError.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Client not found',
            details: 'The client you are trying to delete does not exist',
            suggestion: 'The client may have already been deleted or the ID is incorrect'
          });
        } else {
          console.error('Clients API: Error checking client existence:', clientCheckError);
          return res.status(500).json({ 
            error: 'Failed to verify client',
            details: clientCheckError.message || 'Database error occurred',
            suggestion: 'Please try again or contact support'
          });
        }
      }

      if (!existingClient) {
        return res.status(404).json({ 
          error: 'Client not found',
          details: 'The client you are trying to delete does not exist',
          suggestion: 'Refresh the client list and try again'
        });
      }

      // Attempt to delete the client
      const { error } = await supabaseAdmin
        .from('Customer')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Clients API: Delete error:', error);
        console.error('Clients API: Delete error code:', error.code);
        console.error('Clients API: Delete error message:', error.message);
        console.error('Clients API: Delete error details:', error.details);
        
        // Handle specific deletion errors
        if (error.code === '23503') {
          return res.status(400).json({ 
            error: 'Cannot delete client',
            details: 'This client is referenced by other records and cannot be deleted',
            suggestion: 'Remove all references to this client before deletion'
          });
        } else if (error.code === '23505') {
          return res.status(400).json({ 
            error: 'Cannot delete client',
            details: 'This client has unique constraints that prevent deletion',
            suggestion: 'Contact support for assistance with this deletion'
          });
        } else {
          return res.status(500).json({ 
            error: 'Failed to delete client',
            details: error.message || 'Database error occurred',
            code: error.code,
            suggestion: 'Please try again or contact support if the problem persists'
          });
        }
      }

      console.log('Clients API: Successfully deleted client:', id);
      res.status(200).json({ 
        message: 'Client deleted successfully',
        deletedClient: {
          id: existingClient.id,
          name: `${existingClient.firstName} ${existingClient.lastName}`,
          email: existingClient.email
        }
      });
      
    } catch (error) {
      console.error('Clients API: Error deleting client:', error);
      res.status(500).json({ 
        error: 'Failed to delete client',
        details: 'An unexpected error occurred. Please try again.',
        suggestion: 'If the problem persists, please contact support'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 