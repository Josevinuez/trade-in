import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple security check - just verify we have a token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;
  const deviceId = parseInt(id as string);

  if (!deviceId || isNaN(deviceId)) {
    return res.status(400).json({ error: 'Invalid device ID' });
  }

  if (req.method === 'PUT') {
    try {
      if (!supabaseAdmin) {
        console.error('Devices API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const { storageOptions, ...modelData } = req.body;
      const deviceData = modelData.data || modelData;
      
      console.log('Updating device:', deviceId, 'with data:', deviceData);
      console.log('Storage options:', storageOptions);
      
      try {
        const { data: model, error: modelError } = await supabaseAdmin
          .from('DeviceModel')
          .update({
            name: deviceData.name,
            modelNumber: deviceData.modelNumber,
            releaseYear: parseInt(deviceData.releaseYear),
            imageUrl: deviceData.imageUrl || null,
            categoryId: parseInt(deviceData.categoryId),
            brandId: parseInt(deviceData.brandId),
            displayOrder: parseInt(deviceData.displayOrder) || 0,
          })
          .eq('id', deviceId)
          .select(`
            *,
            category:DeviceCategory(*),
            brand:DeviceBrand(*)
          `)
          .single();

        if (modelError) {
          console.error('Devices API: Model update error:', modelError);
          return res.status(500).json({ error: 'Failed to update model' });
        }
        console.log('Device updated:', model.id);

        // Handle storage options update
        if (storageOptions && storageOptions.length > 0) {
          console.log('Updating storage options:', storageOptions);
          
          // Delete existing storage options for this model
          const { error: deleteError } = await supabaseAdmin
            .from('DeviceStorageOption')
            .delete()
            .eq('deviceModelId', deviceId);

          if (deleteError) {
            console.error('Devices API: Storage options delete error:', deleteError);
            return res.status(500).json({ error: 'Failed to delete existing storage options' });
          }
          console.log('Deleted existing storage options');

          // Create new storage options
          for (const option of storageOptions) {
            console.log('Processing option:', option);
            if (option.storage) {
              console.log('Creating storage option:', option.storage);
              
              try {
                const { data: storageOption, error: storageError } = await supabaseAdmin
                  .from('DeviceStorageOption')
                  .insert({
                    deviceModelId: deviceId,
                    storage: option.storage,
                    excellentPrice: parseFloat(option.excellentPrice || '0'),
                    goodPrice: parseFloat(option.goodPrice || '0'),
                    fairPrice: parseFloat(option.fairPrice || '0'),
                    poorPrice: parseFloat(option.poorPrice || '0'),
                    isActive: true,
                  })
                  .select()
                  .single();

                if (storageError) {
                  console.error('Storage option creation error:', storageError);
                } else {
                  console.log('Storage option created:', storageOption.id);
                }
              } catch (storageError) {
                console.error('Storage option creation failed:', storageError);
              }
            } else {
              console.log('Skipping option - missing storage');
            }
          }
        } else {
          console.log('No storage options provided for update');
        }

        return res.status(200).json(model);
      } catch (error) {
        console.error('Devices API: Model update error:', error);
        return res.status(500).json({ error: 'Failed to update model' });
      }
    } catch (error) {
      console.error('Devices API: Error:', error);
      res.status(500).json({ error: 'Failed to update device' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}