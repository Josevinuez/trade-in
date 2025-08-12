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
      const { type } = req.query;

      if (!supabaseAdmin) {
        console.error('Brands API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      switch (type) {
        case 'brands':
          const { data: allBrands, error } = await supabaseAdmin
            .from('DeviceBrand')
            .select(`
              *,
              _count:DeviceModel(count)
            `)
            .order('name', { ascending: true });
          
          if (error) {
            console.error('Brands API: Fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch brands' });
          }
          
          console.log('Brands API: Successfully fetched brands:', allBrands?.length || 0);
          return res.status(200).json(allBrands);

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brands API: Error:', error);
      return res.status(500).json({ error: 'Failed to fetch brands' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { type, data } = req.body;

      if (!supabaseAdmin) {
        console.error('Brands API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      switch (type) {
        case 'brand':
          const { name, logoUrl } = data;
          
          if (!name) {
            return res.status(400).json({ error: 'Brand name is required' });
          }

          const { data: newBrand, error } = await supabaseAdmin
            .from('DeviceBrand')
            .insert({
              name,
              logoUrl: logoUrl || null,
              isActive: true
            })
            .select()
            .single();

          if (error) {
            console.error('Brands API: Create error:', error);
            
            if (error.code === '23505') {
              return res.status(409).json({ 
                error: 'Brand with this name already exists',
                details: 'A brand with this name is already registered'
              });
            } else {
              return res.status(500).json({ 
                error: 'Failed to create brand',
                details: error.message || 'Database error occurred'
              });
            }
          }

          console.log('Brands API: Successfully created brand:', newBrand.id);
          return res.status(201).json(newBrand);

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brands API: Error:', error);
      return res.status(500).json({ error: 'Failed to create brand' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { type, data } = req.body;

      if (!supabaseAdmin) {
        console.error('Brands API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      switch (type) {
        case 'brand':
          const { id, name, logoUrl, isActive } = data;
          
          if (!id) {
            return res.status(400).json({ error: 'Brand ID is required' });
          }

          const { data: updatedBrand, error } = await supabaseAdmin
            .from('DeviceBrand')
            .update({
              name,
              logoUrl,
              isActive,
              updatedAt: new Date().toISOString()
            })
            .eq('id', id)
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
          return res.status(200).json(updatedBrand);

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brands API: Error:', error);
      return res.status(500).json({ error: 'Failed to update brand' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { type, data } = req.body;

      if (!supabaseAdmin) {
        console.error('Brands API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      switch (type) {
        case 'brand':
          const { id } = data;
          
          if (!id) {
            return res.status(400).json({ error: 'Brand ID is required' });
          }

          const { error } = await supabaseAdmin
            .from('DeviceBrand')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Brands API: Delete error:', error);
            return res.status(500).json({ 
              error: 'Failed to delete brand',
              details: error.message || 'Database error occurred'
            });
          }

          console.log('Brands API: Successfully deleted brand:', id);
          return res.status(200).json({ message: 'Brand deleted successfully' });

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brands API: Error:', error);
      return res.status(500).json({ error: 'Failed to delete brand' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
}