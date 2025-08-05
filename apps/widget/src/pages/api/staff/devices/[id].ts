import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const deviceId = parseInt(id as string);

  if (req.method === 'PUT') {
    try {
      const { type, data, storageOptions } = req.body;

      switch (type) {
        case 'model':
          const deviceData = data;
          
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

            if (modelError) throw modelError;
            console.log('Device updated:', model.id);

            // Handle storage options update
            if (storageOptions && storageOptions.length > 0) {
              console.log('Updating storage options:', storageOptions);
              
              // Delete existing storage options for this model
              const { error: deleteError } = await supabaseAdmin
                .from('DeviceStorageOption')
                .delete()
                .eq('deviceModelId', deviceId);

              if (deleteError) throw deleteError;
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
                      })
                      .select()
                      .single();

                    if (storageError) throw storageError;
                    console.log('Storage option created:', storageOption);
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
      console.log('Deleting device:', deviceId);

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