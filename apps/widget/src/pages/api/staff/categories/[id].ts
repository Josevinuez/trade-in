import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple security check - just verify we have a token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;
  const categoryId = parseInt(id as string);

  if (!categoryId || isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  if (req.method === 'PUT') {
    try {
      if (!supabaseAdmin) {
        console.error('Categories API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { name, description, displayOrder, isActive } = req.body;
      
      console.log('Updating category:', categoryId, 'with data:', { name, description, displayOrder, isActive });
      
      try {
        const { data: category, error: categoryError } = await supabaseAdmin
          .from('DeviceCategory')
          .update({
            name,
            description: description || null,
            displayOrder: displayOrder || 0,
            isActive: isActive !== undefined ? isActive : true,
          })
          .eq('id', categoryId)
          .select()
          .single();

        if (categoryError) {
          console.error('Categories API: Category update error:', categoryError);
          return res.status(500).json({ error: 'Failed to update category' });
        }

        console.log('Category updated:', category.id);
        return res.status(200).json({ success: true, category });

      } catch (error) {
        console.error('Categories API: Database error:', error);
        return res.status(500).json({ error: 'Database error occurred' });
      }

    } catch (error) {
      console.error('Categories API: Unexpected error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
