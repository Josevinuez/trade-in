import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';
import { withSecurity } from '../../../lib/security';

export default withSecurity({
  auth: false, // Public endpoint but needs security
  rateLimit: {
    windowMs: 60 * 1000,
    limit: 100,
    keyPrefix: 'conditions:',
  },
  cors: true,
  sizeLimit: '1mb',
  securityHeaders: true,
})(handler);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: conditions, error } = await supabaseAdmin
      .from('DeviceCondition')
      .select('*')
      .eq('isActive', true)
      .order('name', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      conditions
    });

  } catch (error) {
    console.error('Device conditions error:', error);
    res.status(500).json({ error: 'Failed to fetch device conditions' });
  }
} 