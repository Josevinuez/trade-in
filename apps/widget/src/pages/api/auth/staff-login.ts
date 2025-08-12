import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    if (!supabaseAdmin) {
      console.error('Staff Login API: supabaseAdmin not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        details: 'Email and password are required'
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

    // Check if staff user exists and is active
    const { data: staff, error } = await supabaseAdmin
      .from('staff')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !staff) {
      console.error('Staff Login API: Staff lookup error:', error);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    // For now, we'll use a simple password check
    // In production, you should use proper password hashing
    if (password !== 'demo123') {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    // Create a simple session token (in production, use proper JWT)
    const sessionToken = Buffer.from(`${staff.id}:${staff.email}:${Date.now()}`).toString('base64');

    console.log('Staff Login API: Successfully authenticated staff:', staff.email);
    res.status(200).json({
      success: true,
      user: {
        id: staff.id,
        email: staff.email,
        firstName: staff.first_name,
        lastName: staff.last_name,
        role: staff.role
      },
      token: sessionToken
    });

  } catch (error) {
    console.error('Staff Login API: Error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      details: 'An unexpected error occurred. Please try again.'
    });
  }
}