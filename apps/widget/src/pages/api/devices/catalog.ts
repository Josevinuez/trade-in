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
        console.error('Devices Catalog API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      console.log('Devices Catalog API: Fetching data from database...');

      // Fetch all required data from database using correct PascalCase table names
      const [categoriesResult, brandsResult, modelsResult] = await Promise.all([
        supabaseAdmin
          .from('DeviceCategory')
          .select('*')
          .eq('isActive', true)
          .order('name', { ascending: true }),
        supabaseAdmin
          .from('DeviceBrand')
          .select('*')
          .eq('isActive', true)
          .order('name', { ascending: true }),
        supabaseAdmin
          .from('DeviceModel')
          .select(`
            *,
            category:DeviceCategory(*),
            brand:DeviceBrand(*),
            storageOptions:DeviceStorageOption(*)
          `)
          .eq('isActive', true)
          .order('displayOrder', { ascending: true })
          .order('name', { ascending: true })
      ]);

      // Check for errors
      if (categoriesResult.error) {
        console.error('Devices Catalog API: Categories error:', categoriesResult.error);
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }
      if (brandsResult.error) {
        console.error('Devices Catalog API: Brands error:', brandsResult.error);
        return res.status(500).json({ error: 'Failed to fetch brands' });
      }
      if (modelsResult.error) {
        console.error('Devices Catalog API: Models error:', modelsResult.error);
        return res.status(500).json({ error: 'Failed to fetch models' });
      }

      // Transform data to camelCase and ensure proper structure
      const transformedData = {
        categories: transformToCamelCase(categoriesResult.data || []),
        brands: transformToCamelCase(brandsResult.data || []),
        models: transformToCamelCase(modelsResult.data || [])
      };

      // Log successful response for debugging
      console.log('Devices Catalog API: Successfully fetched data from database:', {
        categories: transformedData.categories.length,
        brands: transformedData.brands.length,
        models: transformedData.models.length
      });

      // Log a sample model to see its structure with storage options
      if (transformedData.models.length > 0) {
        console.log('Devices Catalog API: Sample model with storage options:', JSON.stringify(transformedData.models[0], null, 2));
      }

      // Return data from database
      res.status(200).json(transformedData);
    } catch (error) {
      console.error('Devices Catalog API: Error:', error);
      res.status(500).json({ error: 'Failed to fetch devices from database' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 