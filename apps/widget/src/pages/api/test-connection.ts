import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    if (!supabaseAdmin) {
      console.error('Test Connection API: supabaseAdmin not available');
      return res.status(500).json({ 
        error: 'Database connection not available',
        details: 'SUPABASE_SERVICE_ROLE_KEY environment variable may be missing'
      });
    }

    // Test basic database connection
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('DeviceCategory')
      .select('count')
      .limit(1);

    if (categoriesError) {
      console.error('Test Connection API: Database test failed:', categoriesError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: categoriesError.message
      });
    }

    // Test if we can fetch actual data
    const { data: sampleCategories, error: sampleError } = await supabaseAdmin
      .from('DeviceCategory')
      .select('*')
      .limit(3);

    if (sampleError) {
      console.error('Test Connection API: Data fetch failed:', sampleError);
      return res.status(500).json({ 
        error: 'Data fetch failed',
        details: sampleError.message
      });
    }

    console.log('Test Connection API: Database connection successful');
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      categoriesCount: sampleCategories?.length || 0,
      sampleData: sampleCategories
    });

  } catch (error) {
    console.error('Test Connection API: Error:', error);
    res.status(500).json({ 
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
