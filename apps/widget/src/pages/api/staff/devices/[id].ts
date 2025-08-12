import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../utils/supabase';
import { withSecurity } from '../../../../lib/security';
import { schemas } from '../../../../lib/validation';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const deviceId = parseInt(id as string);

  if (req.method === 'PUT') {
    try {
      const { type, data, storageOptions } = req.body;

      switch (type) {
        case 'model':
          const deviceData = data;
          
          try {
            const { data: model, error: modelError } = await supabaseAdmin
              .from('DeviceModel')
              .update({
                 name: deviceData.name,
                 modelNumber: deviceData.modelNumber || null,
                 releaseYear: deviceData.releaseYear ? parseInt(String(deviceData.releaseYear)) : null,
                 imageUrl: deviceData.imageUrl || null,
                 categoryId: parseInt(String(deviceData.categoryId)),
                 brandId: parseInt(String(deviceData.brandId)),
                 displayOrder: deviceData.displayOrder ? parseInt(String(deviceData.displayOrder)) : 0,
              })
              .eq('id', deviceId)
              .select(`
                *,
                category:DeviceCategory(*),
                brand:DeviceBrand(*)
              `)
              .single();

            if (modelError) throw modelError;

            // Handle storage options update
            if (storageOptions && storageOptions.length > 0) {
              // Delete existing storage options for this model
              const { error: deleteError } = await supabaseAdmin
                .from('DeviceStorageOption')
                .delete()
                .eq('deviceModelId', deviceId);

              if (deleteError) throw deleteError;

              // Create new storage options
              for (const option of storageOptions) {
                if (option.storage) {
                  try {
                    const { data: storageOption, error: storageError } = await supabaseAdmin
                      .from('DeviceStorageOption')
                      .insert({
                        deviceModelId: deviceId,
                        storage: option.storage,
                        excellentPrice: parseFloat(String(option.excellentPrice ?? '0')),
                        goodPrice: parseFloat(String(option.goodPrice ?? '0')),
                        fairPrice: parseFloat(String(option.fairPrice ?? '0')),
                        poorPrice: parseFloat(String(option.poorPrice ?? '0')),
                      })
                      .select()
                      .single();

                    if (storageError) throw storageError;
                  } catch (storageError) {
                    console.error('Storage option creation failed:', storageError);
                  }
                }
              }
            }

            return res.status(200).json(model);
          } catch (error) {
            console.error('Device update error:', error);
            return res.status(500).json({ error: 'Failed to update device', details: error instanceof Error ? error.message : 'Unknown error' });
          }

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error) {
      console.error('Device update error:', error);
      return res.status(500).json({ error: 'Failed to update device' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Delete storage options first
      const { error: deleteStorageError } = await supabaseAdmin
        .from('DeviceStorageOption')
        .delete()
        .eq('deviceModelId', deviceId);

      if (deleteStorageError) throw deleteStorageError;

      // Delete the device model
      const { error: deleteModelError } = await supabaseAdmin
        .from('DeviceModel')
        .delete()
        .eq('id', deviceId);

      if (deleteModelError) {
        // If deletion fails due to foreign key constraint, return specific error
        if (deleteModelError.code === '23503') {
          return res.status(400).json({ error: 'FOREIGN_KEY_CONSTRAINT' });
        }
        throw deleteModelError;
      }

      res.status(200).json({ message: 'Device deleted successfully' });
    } catch (error) {
      console.error('Error deleting device:', error);
      res.status(500).json({ error: 'Failed to delete device' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Apply comprehensive security middleware
export default withSecurity({
  auth: true, // Require authentication
  roles: ['staff'], // Only staff can access
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    limit: 60, // 60 requests per minute
    keyPrefix: 'devices:',
  },
  cors: true, // Enable CORS
  sizeLimit: '2mb', // Limit request size (allow for image uploads)
  validation: {
    PUT: schemas.device.update, // Use the device update schema
  },
  securityHeaders: true, // Enable security headers
})(handler);