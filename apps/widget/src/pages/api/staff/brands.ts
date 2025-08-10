import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';
import { withAuth, withRateLimit } from '../../../lib/security';
import { z } from 'zod';

const brandSchema = z.object({
  name: z.string().min(1).max(100),
  logoUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { type } = req.query;

      switch (type) {
        case 'brands':
          const { data: allBrands, error } = await supabaseAdmin
            .from('DeviceBrand')
            .select(`
              *,
              _count:DeviceModel(count)
            `)
            .order('name', { ascending: true });
          
          if (error) throw error;
          return res.status(200).json(allBrands);

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brand fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch brands' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { type, data } = req.body;

      switch (type) {
        case 'brand':
          const { name, logoUrl } = brandSchema.parse(data);
          
          const { data: newBrand, error } = await supabaseAdmin
            .from('DeviceBrand')
            .insert({
              name,
              logoUrl: logoUrl || null,
              isActive: true
            })
            .select()
            .single();

          if (error) throw error;
          return res.status(201).json(newBrand);

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brand creation error:', error);
      return res.status(500).json({ error: 'Failed to create brand' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(['staff'])(withRateLimit({ windowMs: 60_000, limit: 60, keyPrefix: 'staff:' })(handler));