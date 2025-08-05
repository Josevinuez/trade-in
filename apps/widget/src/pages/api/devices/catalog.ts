import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting device catalog fetch...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Service key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const [categoriesResult, brandsResult, conditionsResult, modelsResult] = await Promise.all([
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
        .from('DeviceCondition')
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
        .order('name', { ascending: true })
    ]);

    console.log('Categories result:', categoriesResult);
    console.log('Brands result:', brandsResult);
    console.log('Conditions result:', conditionsResult);
    console.log('Models result:', modelsResult);

    if (categoriesResult.error) {
      console.error('Categories error:', categoriesResult.error);
      throw categoriesResult.error;
    }
    if (brandsResult.error) {
      console.error('Brands error:', brandsResult.error);
      throw brandsResult.error;
    }
    if (conditionsResult.error) {
      console.error('Conditions error:', conditionsResult.error);
      throw conditionsResult.error;
    }
    if (modelsResult.error) {
      console.error('Models error:', modelsResult.error);
      throw modelsResult.error;
    }

    const result = {
      categories: categoriesResult.data || [],
      brands: brandsResult.data || [],
      conditions: conditionsResult.data || [],
      models: modelsResult.data || []
    };

    console.log('Device catalog fetch successful:', {
      categoriesCount: result.categories.length,
      brandsCount: result.brands.length,
      conditionsCount: result.conditions.length,
      modelsCount: result.models.length
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Device catalog error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch device catalog',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 