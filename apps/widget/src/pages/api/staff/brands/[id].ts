import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple security check - just verify we have a token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;
  const brandId = parseInt(id as string);

  if (!brandId || isNaN(brandId)) {
    return res.status(400).json({ error: 'Invalid brand ID' });
  }

  if (req.method === 'PUT') {
    try {
      if (!supabaseAdmin) {
        console.error('Brands API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { name, logoUrl, isActive } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Brand name is required' });
      }

      const { data: updatedBrand, error } = await supabaseAdmin
        .from('DeviceBrand')
        .update({
          name,
          logoUrl,
          isActive,
          updatedAt: new Date().toISOString()
        })
        .eq('id', brandId)
        .select()
        .single();

      if (error) {
        console.error('Brands API: Update error:', error);
        return res.status(500).json({ 
          error: 'Failed to update brand',
          details: error.message || 'Database error occurred'
        });
      }

      console.log('Brands API: Successfully updated brand:', updatedBrand.id);
      res.status(200).json(updatedBrand);
    } catch (error) {
      console.error('Brands API: Error:', error);
      res.status(500).json({ error: 'Failed to update brand' });
    }
  } else if (req.method === 'DELETE') {
    try {
      if (!supabaseAdmin) {
        console.error('Brands API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { error } = await supabaseAdmin
        .from('DeviceBrand')
        .delete()
        .eq('id', brandId);

      if (error) {
        console.error('Brands API: Delete error:', error);
        return res.status(500).json({ 
          error: 'Failed to delete brand',
          details: error.message || 'Database error occurred'
        });
      }

      console.log('Brands API: Successfully deleted brand:', brandId);
      res.status(200).json({ message: 'Brand deleted successfully' });
    } catch (error) {
      console.error('Brands API: Error:', error);
      res.status(500).json({ error: 'Failed to delete brand' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}