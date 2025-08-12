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
      if (!supabaseAdmin) {
        console.error('Device Conditions API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { data: conditions, error } = await supabaseAdmin
        .from('DeviceCondition')
        .select('*')
        .eq('isActive', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Device Conditions API: Error:', error);
        return res.status(500).json({ error: 'Failed to fetch conditions' });
      }

      res.status(200).json(conditions);
    } catch (error) {
      console.error('Device Conditions API: Error:', error);
      res.status(500).json({ error: 'Failed to fetch conditions' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 