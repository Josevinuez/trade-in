import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';
import { withSecurity } from '../../../lib/security';

export default withSecurity({
  auth: false, // Public endpoint but needs security
  rateLimit: {
    windowMs: 60 * 1000,
    limit: 100,
    keyPrefix: 'catalog:',
  },
  cors: true,
  sizeLimit: '1mb',
  securityHeaders: true,
})(handler);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
      // Production logging removed for security

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

          // Production logging removed for security

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

    // Production logging removed for security

    res.status(200).json(result);

  } catch (error) {
    console.error('Device catalog error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch device catalog',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 