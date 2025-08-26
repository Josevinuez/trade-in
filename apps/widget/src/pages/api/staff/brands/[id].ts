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

      const { data: brandData, type } = req.body;
      
      console.log('Brands API: Received request body:', req.body);
      
      if (!brandData) {
        return res.status(400).json({ 
          error: 'Brand data is required',
          details: 'The request body must contain a "data" field with brand information',
          suggestion: 'Check the request format and ensure brand data is properly structured'
        });
      }

      const { name, logoUrl, isActive } = brandData;

      console.log('Brands API: Updating brand with data:', { name, logoUrl, isActive });

      if (!name) {
        return res.status(400).json({ error: 'Brand name is required' });
      }

      // Validate that the brand exists before updating
      const { data: existingBrand, error: checkError } = await supabaseAdmin
        .from('DeviceBrand')
        .select('id, name')
        .eq('id', brandId)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Brand not found',
            details: 'The brand you are trying to update does not exist',
            suggestion: 'The brand may have already been deleted or the ID is incorrect'
          });
        } else {
          console.error('Brands API: Error checking brand existence:', checkError);
          return res.status(500).json({ 
            error: 'Failed to verify brand',
            details: checkError.message || 'Database error occurred',
            suggestion: 'Please try again or contact support'
          });
        }
      }

      if (!existingBrand) {
        return res.status(404).json({ 
          error: 'Brand not found',
          details: 'The brand you are trying to update does not exist',
          suggestion: 'Refresh the brand list and try again'
        });
      }

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

      if (error) {
        console.error('Brands API: Update error:', error);
        console.error('Brands API: Error code:', error.code);
        console.error('Brands API: Error message:', error.message);
        
        // Handle specific database errors
        if (error.code === '23505') {
          return res.status(400).json({ 
            error: 'Brand name already exists',
            details: 'A brand with this name already exists',
            suggestion: 'Choose a different name for this brand'
          });
        } else if (error.code === '23503') {
          return res.status(400).json({ 
            error: 'Cannot update brand',
            details: 'This brand is referenced by other records and cannot be updated',
            suggestion: 'Remove all references to this brand before updating'
          });
        } else {
          return res.status(500).json({ 
            error: 'Failed to update brand',
            details: error.message || 'Database error occurred',
            suggestion: 'Please try again or contact support if the problem persists'
          });
        }
      }

      console.log('Brands API: Successfully updated brand:', updatedBrand.id);
      console.log('Brands API: Updated data:', { name: updatedBrand.name, logoUrl: updatedBrand.logoUrl, isActive: updatedBrand.isActive });
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