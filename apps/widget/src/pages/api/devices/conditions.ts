import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

// Helper function to transform snake_case to camelCase
function transformToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(transformToCamelCase);
  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      transformed[camelKey] = transformToCamelCase(value);
    }
    return transformed;
  }
  return obj;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      if (!supabaseAdmin) {
        console.error('Device Conditions API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      console.log('Device Conditions API: Fetching conditions from database...');

      const { data: conditions, error } = await supabaseAdmin
        .from('DeviceCondition')
        .select('*')
        .eq('isActive', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Device Conditions API: Error:', error);
        return res.status(500).json({ error: 'Failed to fetch conditions' });
      }

      // Transform data to camelCase
      const transformedConditions = transformToCamelCase(conditions || []);

      // Log successful response for debugging
      console.log('Device Conditions API: Successfully fetched conditions from database:', transformedConditions.length);

      // Return data from database
      res.status(200).json({
        conditions: transformedConditions
      });
    } catch (error) {
      console.error('Device Conditions API: Error:', error);
      res.status(500).json({ error: 'Failed to fetch conditions from database' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 