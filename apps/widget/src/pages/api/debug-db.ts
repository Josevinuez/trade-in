import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      console.log('Debug API: Checking database structure...');

      // Check what tables exist
      const tablesToCheck = [
        'DeviceCategory',
        'DeviceBrand', 
        'DeviceModel',
        'DeviceCondition',
        'DeviceStorageOption',
        'device_storage_options',
        'device_storage_option'
      ];

      const tableResults: any = {};

      for (const tableName of tablesToCheck) {
        try {
          const result = await supabaseAdmin
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (result.error) {
            tableResults[tableName] = { exists: false, error: result.error.message };
          } else {
            tableResults[tableName] = { 
              exists: true, 
              count: result.data?.length || 0,
              sample: result.data?.[0] || null
            };
          }
        } catch (err) {
          tableResults[tableName] = { exists: false, error: 'Exception occurred' };
        }
      }

      // Check DeviceModel structure specifically
      let modelStructure = null;
      try {
        const modelResult = await supabaseAdmin
          .from('DeviceModel')
          .select('*')
          .limit(1);
        
        if (!modelResult.error && modelResult.data && modelResult.data.length > 0) {
          modelStructure = modelResult.data[0];
        }
      } catch (err) {
        modelStructure = { error: 'Failed to fetch model structure' };
      }

      // Check if there are any storage-related columns in DeviceModel
      let storageColumns = null;
      if (modelStructure && !modelStructure.error) {
        storageColumns = Object.keys(modelStructure).filter(key => 
          key.toLowerCase().includes('storage') || 
          key.toLowerCase().includes('price') ||
          key.toLowerCase().includes('option')
        );
      }

      const debugInfo = {
        timestamp: new Date().toISOString(),
        tables: tableResults,
        modelStructure: modelStructure,
        storageColumns: storageColumns,
        message: 'Database structure check completed'
      };

      console.log('Debug API: Database structure:', debugInfo);
      res.status(200).json(debugInfo);

    } catch (error) {
      console.error('Debug API: Error:', error);
      res.status(500).json({ error: 'Debug failed', details: error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
