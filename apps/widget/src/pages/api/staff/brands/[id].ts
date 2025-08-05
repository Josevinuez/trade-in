import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const brandId = parseInt(id as string);

  if (req.method === 'PUT') {
    try {
      const { type, data } = req.body;

      switch (type) {
        case 'brand':
          const { name, logoUrl, isActive } = data;
          
          const { data: updatedBrand, error } = await supabaseAdmin
            .from('DeviceBrand')
            .update({
              name,
              logoUrl: logoUrl || null,
              isActive: isActive !== undefined ? isActive : true
            })
            .eq('id', brandId)
            .select()
            .single();

          if (error) throw error;
          return res.status(200).json(updatedBrand);

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brand update error:', error);
      return res.status(500).json({ error: 'Failed to update brand' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Check if brand has associated devices
      const { data: devices, error: devicesError } = await supabaseAdmin
        .from('DeviceModel')
        .select('id')
        .eq('brandId', brandId);

      if (devicesError) throw devicesError;

      if (devices && devices.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete brand. It has associated device models.' 
        });
      }

      const { error } = await supabaseAdmin
        .from('DeviceBrand')
        .delete()
        .eq('id', brandId);

      if (error) throw error;
      return res.status(200).json({ message: 'Brand deleted successfully' });
    } catch (error: any) {
      console.error('Brand deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete brand' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 