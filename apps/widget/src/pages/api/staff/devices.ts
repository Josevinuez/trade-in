import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { type } = req.query;

      switch (type) {
        case 'categories':
          console.log('Fetching categories...');
          const { data: categoriesData, error: categoriesError } = await supabaseAdmin
            .from('DeviceCategory')
            .select('*')
            .order('name', { ascending: true });
          
          if (categoriesError) throw categoriesError;
          console.log('Categories found:', categoriesData);
          return res.status(200).json(categoriesData);

        case 'brands':
          const { data: brandsData, error: brandsError } = await supabaseAdmin
            .from('DeviceBrand')
            .select('*')
            .order('name', { ascending: true });
          
          if (brandsError) throw brandsError;
          return res.status(200).json(brandsData);

        case 'conditions':
          const { data: conditionsData, error: conditionsError } = await supabaseAdmin
            .from('DeviceCondition')
            .select('*')
            .order('name', { ascending: true });
          
          if (conditionsError) throw conditionsError;
          return res.status(200).json(conditionsData);

        case 'models':
          try {
            const { data: modelsData, error: modelsError } = await supabaseAdmin
              .from('DeviceModel')
              .select(`
                *,
                category:DeviceCategory(*),
                brand:DeviceBrand(*),
                storageOptions:DeviceStorageOption(*)
              `)
              .order('name', { ascending: true });
            
            if (modelsError) throw modelsError;
            return res.status(200).json(modelsData);
          } catch (error) {
            console.error('Models fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch models' });
          }

        default:
          const [categoriesResult, brandsResult, conditionsResult, modelsResult] = await Promise.all([
            supabaseAdmin.from('DeviceCategory').select('*').order('name', { ascending: true }),
            supabaseAdmin.from('DeviceBrand').select('*').order('name', { ascending: true }),
            supabaseAdmin.from('DeviceCondition').select('*').order('name', { ascending: true }),
            supabaseAdmin.from('DeviceModel').select(`
              *,
              category:DeviceCategory(*),
              brand:DeviceBrand(*),
              storageOptions:DeviceStorageOption(*)
            `).order('name', { ascending: true })
          ]);

          if (categoriesResult.error) throw categoriesResult.error;
          if (brandsResult.error) throw brandsResult.error;
          if (conditionsResult.error) throw conditionsResult.error;
          if (modelsResult.error) throw modelsResult.error;

          return res.status(200).json({
            categories: categoriesResult.data,
            brands: brandsResult.data,
            conditions: conditionsResult.data,
            models: modelsResult.data
          });
      }
    } catch (error) {
      console.error('Device catalog error:', error);
      return res.status(500).json({ error: 'Failed to fetch device catalog' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { type, data } = req.body;

      switch (type) {
        case 'category':
          const { data: category, error: categoryError } = await supabaseAdmin
            .from('DeviceCategory')
            .insert({
              name: data.name,
              description: data.description,
              icon: data.icon,
            })
            .select()
            .single();
          
          if (categoryError) throw categoryError;
          return res.status(201).json(category);

        case 'brand':
          const { data: brand, error: brandError } = await supabaseAdmin
            .from('DeviceBrand')
            .insert({
              name: data.name,
              logoUrl: data.logoUrl,
            })
            .select()
            .single();
          
          if (brandError) throw brandError;
          return res.status(201).json(brand);

        case 'condition':
          const { data: condition, error: conditionError } = await supabaseAdmin
            .from('DeviceCondition')
            .insert({
              name: data.name,
              description: data.description,
            })
            .select()
            .single();
          
          if (conditionError) throw conditionError;
          return res.status(201).json(condition);

        case 'model':
          const { storageOptions, ...modelData } = req.body;
          const deviceData = modelData.data || modelData;
          
          console.log('Creating device with data:', deviceData);
          console.log('Storage options:', storageOptions);
          
          try {
            // Validate required fields
            if (!deviceData.name || !deviceData.categoryId || !deviceData.brandId) {
              return res.status(400).json({ 
                error: 'Missing required fields', 
                details: 'Name, category, and brand are required' 
              });
            }

            const { data: model, error: modelError } = await supabaseAdmin
              .from('DeviceModel')
              .insert({
                name: deviceData.name,
                modelNumber: deviceData.modelNumber || null,
                releaseYear: deviceData.releaseYear ? parseInt(deviceData.releaseYear) : null,
                imageUrl: deviceData.imageUrl || null,
                categoryId: parseInt(deviceData.categoryId),
                brandId: parseInt(deviceData.brandId),
                displayOrder: deviceData.displayOrder ? parseInt(deviceData.displayOrder) : 0,
                isActive: true,
              })
              .select(`
                *,
                category:DeviceCategory(*),
                brand:DeviceBrand(*)
              `)
              .single();

            if (modelError) throw modelError;
            console.log('Device created:', model.id);

            // Create storage options if provided
            if (storageOptions && storageOptions.length > 0) {
              console.log('Creating storage options:', storageOptions);
              
              for (const option of storageOptions) {
                console.log('Processing option:', option);
                if (option.storage) {
                  console.log('Creating storage option:', option.storage);
                  
                  try {
                    const { data: storageOption, error: storageError } = await supabaseAdmin
                      .from('DeviceStorageOption')
                      .insert({
                        deviceModelId: model.id,
                        storage: option.storage,
                        excellentPrice: option.excellentPrice ? parseFloat(option.excellentPrice) : 0,
                        goodPrice: option.goodPrice ? parseFloat(option.goodPrice) : 0,
                        fairPrice: option.fairPrice ? parseFloat(option.fairPrice) : 0,
                        poorPrice: option.poorPrice ? parseFloat(option.poorPrice) : 0,
                        isActive: true,
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
              console.log('No storage options provided');
            }

            return res.status(201).json(model);
          } catch (error) {
            console.error('Device creation error:', error);
            return res.status(500).json({ error: 'Failed to create device', details: error instanceof Error ? error.message : 'Unknown error' });
          }

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error) {
      console.error('Device creation error:', error);
      return res.status(500).json({ error: 'Failed to create device' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { type, id, data } = req.body;
      const deviceId = id || req.query.id; // Get ID from body or query params

      switch (type) {
        case 'category':
          const { data: category, error: categoryError } = await supabaseAdmin
            .from('DeviceCategory')
            .update({
              name: data.name,
              description: data.description,
              icon: data.icon,
              isActive: data.isActive,
            })
            .eq('id', parseInt(deviceId))
            .select()
            .single();
          
          if (categoryError) throw categoryError;
          return res.status(200).json(category);

        case 'brand':
          const { data: brand, error: brandError } = await supabaseAdmin
            .from('DeviceBrand')
            .update({
              name: data.name,
              logoUrl: data.logoUrl,
              isActive: data.isActive,
            })
            .eq('id', parseInt(deviceId))
            .eq('id', parseInt(deviceId))
            .select()
            .single();
          
          if (brandError) throw brandError;
          return res.status(200).json(brand);

        case 'condition':
          const { data: condition, error: conditionError } = await supabaseAdmin
            .from('DeviceCondition')
            .update({
              name: data.name,
              description: data.description,
              isActive: data.isActive,
            })
            .eq('id', parseInt(deviceId))
            .select()
            .single();
          
          if (conditionError) throw conditionError;
          return res.status(200).json(condition);

        case 'model':
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
              .eq('id', parseInt(deviceId))
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
                .eq('deviceModelId', parseInt(deviceId));

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
                        deviceModelId: parseInt(deviceId),
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
  }

  if (req.method === 'DELETE') {
    try {
      const deviceId = req.query.id;
      
      if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
      }

      console.log('Deleting device:', deviceId);

      // Delete storage options first
      const { error: deleteStorageError } = await supabaseAdmin
        .from('DeviceStorageOption')
        .delete()
        .eq('deviceModelId', parseInt(deviceId as string));

      if (deleteStorageError) throw deleteStorageError;
      console.log('Deleted storage options for device:', deviceId);

      // Delete the device
      const { data: deletedDevice, error: deleteDeviceError } = await supabaseAdmin
        .from('DeviceModel')
        .delete()
        .eq('id', parseInt(deviceId as string))
        .select()
        .single();

      if (deleteDeviceError) throw deleteDeviceError;
      console.log('Deleted device:', deletedDevice.id);

      return res.status(200).json({ message: 'Device deleted successfully' });
    } catch (error) {
      console.error('Device deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete device', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 