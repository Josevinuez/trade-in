import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple security check - just verify we have a token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    try {
      const { type } = req.query;

      if (!supabaseAdmin) {
        console.error('Devices API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      switch (type) {
        case 'categories':
          console.log('Fetching categories...');
          const { data: categoriesData, error: categoriesError } = await supabaseAdmin
            .from('DeviceCategory')
            .select('*')
            .order('name', { ascending: true });
          
          if (categoriesError) {
            console.error('Devices API: Categories error:', categoriesError);
            return res.status(500).json({ error: 'Failed to fetch categories' });
          }
          console.log('Categories found:', categoriesData?.length || 0);
          return res.status(200).json(categoriesData);

        case 'brands':
          const { data: brandsData, error: brandsError } = await supabaseAdmin
            .from('DeviceBrand')
            .select('*')
            .order('name', { ascending: true });
          
          if (brandsError) {
            console.error('Devices API: Brands error:', brandsError);
            return res.status(500).json({ error: 'Failed to fetch brands' });
          }
          return res.status(200).json(brandsData);

        case 'conditions':
          const { data: conditionsData, error: conditionsError } = await supabaseAdmin
            .from('DeviceCondition')
            .select('*')
            .order('name', { ascending: true });
          
          if (conditionsError) {
            console.error('Devices API: Conditions error:', conditionsError);
            return res.status(500).json({ error: 'Failed to fetch conditions' });
          }
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
            
            if (modelsError) {
              console.error('Devices API: Models error:', modelsError);
              return res.status(500).json({ error: 'Failed to fetch models' });
            }
            return res.status(200).json(modelsData);
          } catch (error) {
            console.error('Devices API: Models fetch error:', error);
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

          if (categoriesResult.error) {
            console.error('Devices API: Categories error:', categoriesResult.error);
            return res.status(500).json({ error: 'Failed to fetch categories' });
          }
          if (brandsResult.error) {
            console.error('Devices API: Brands error:', brandsResult.error);
            return res.status(500).json({ error: 'Failed to fetch brands' });
          }
          if (conditionsResult.error) {
            console.error('Devices API: Conditions error:', conditionsResult.error);
            return res.status(500).json({ error: 'Failed to fetch conditions' });
          }
          if (modelsResult.error) {
            console.error('Devices API: Models error:', modelsResult.error);
            return res.status(500).json({ error: 'Failed to fetch models' });
          }

          return res.status(200).json({
            categories: categoriesResult.data,
            brands: brandsResult.data,
            conditions: conditionsResult.data,
            models: modelsResult.data
          });
      }
    } catch (error) {
      console.error('Devices API: Error:', error);
      return res.status(500).json({ error: 'Failed to fetch device catalog' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { type, data } = req.body;

      if (!supabaseAdmin) {
        console.error('Devices API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

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
          
          if (categoryError) {
            console.error('Devices API: Category create error:', categoryError);
            return res.status(500).json({ error: 'Failed to create category' });
          }
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
          
          if (brandError) {
            console.error('Devices API: Brand create error:', brandError);
            return res.status(500).json({ error: 'Failed to create brand' });
          }
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
          
          if (conditionError) {
            console.error('Devices API: Condition create error:', conditionError);
            return res.status(500).json({ error: 'Failed to create condition' });
          }
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

            if (modelError) {
              console.error('Devices API: Model create error:', modelError);
              return res.status(500).json({ error: 'Failed to create model' });
            }
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
                  } catch (storageErr) {
                    console.error('Storage option creation failed:', storageErr);
                  }
                }
              }
            }

            return res.status(201).json(model);
          } catch (modelErr) {
            console.error('Model creation failed:', modelErr);
            return res.status(500).json({ error: 'Failed to create model' });
          }

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Devices API: Error:', error);
      return res.status(500).json({ error: 'Failed to create device item' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { type, id, data } = req.body;
      const deviceId = id || req.query.id; // Get ID from body or query params

      if (!supabaseAdmin) {
        console.error('Devices API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

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
          
          if (categoryError) {
            console.error('Devices API: Category update error:', categoryError);
            return res.status(500).json({ error: 'Failed to update category' });
          }
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
            .select()
            .single();
          
          if (brandError) {
            console.error('Devices API: Brand update error:', brandError);
            return res.status(500).json({ error: 'Failed to update brand' });
          }
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
          
          if (conditionError) {
            console.error('Devices API: Condition update error:', conditionError);
            return res.status(500).json({ error: 'Failed to update condition' });
          }
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
                .eq('deviceModelId', parseInt(deviceId));

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
                        deviceModelId: parseInt(deviceId),
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

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error) {
      console.error('Devices API: Error:', error);
      return res.status(500).json({ error: 'Failed to update device' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deviceId = req.query.id;
      
      if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
      }

      if (!supabaseAdmin) {
        console.error('Devices API: supabaseAdmin not available');
        return res.status(500).json({ error: 'Database connection not available' });
      }

      console.log('Deleting device:', deviceId);

      // Check if device exists before attempting deletion
      const { data: existingDevice, error: deviceCheckError } = await supabaseAdmin
        .from('DeviceModel')
        .select('id, name, modelNumber')
        .eq('id', parseInt(deviceId as string))
        .single();

      if (deviceCheckError) {
        if (deviceCheckError.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Device not found',
            details: 'The device you are trying to delete does not exist',
            suggestion: 'The device may have already been deleted or the ID is incorrect'
          });
        } else {
          console.error('Devices API: Error checking device existence:', deviceCheckError);
          return res.status(500).json({ 
            error: 'Failed to verify device',
            details: deviceCheckError.message || 'Database error occurred',
            suggestion: 'Please try again or contact support'
          });
        }
      }

      if (!existingDevice) {
        return res.status(404).json({ 
          error: 'Device not found',
          details: 'The device you are trying to delete does not exist',
          suggestion: 'Refresh the device list and try again'
        });
      }

      // Check if device has associated trade-in orders
      const { data: existingOrders, error: ordersCheckError } = await supabaseAdmin
        .from('TradeInOrder')
        .select('id, orderNumber, status')
        .eq('deviceModelId', parseInt(deviceId as string));

      if (ordersCheckError) {
        console.error('Devices API: Orders check error:', ordersCheckError);
        return res.status(500).json({ error: 'Failed to check for existing orders' });
      }

      if (existingOrders && existingOrders.length > 0) {
        const orderDetails = existingOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber || `Order #${order.id}`,
          status: order.status
        }));
        
        console.error('Devices API: Cannot delete device with existing orders');
        return res.status(400).json({ 
          error: 'Cannot delete device',
          details: `This device has ${existingOrders.length} existing order(s) and cannot be deleted`,
          orderCount: existingOrders.length,
          orders: orderDetails,
          suggestion: 'Delete or reassign the orders first, then try deleting the device again'
        });
      }

      // Delete storage options first
      const { error: deleteStorageError } = await supabaseAdmin
        .from('DeviceStorageOption')
        .delete()
        .eq('deviceModelId', parseInt(deviceId as string));

      if (deleteStorageError) {
        console.error('Devices API: Storage options delete error:', deleteStorageError);
        return res.status(500).json({ error: 'Failed to delete storage options' });
      }
      console.log('Deleted storage options for device:', deviceId);

      // Delete the device
      const { data: deletedDevice, error: deleteDeviceError } = await supabaseAdmin
        .from('DeviceModel')
        .delete()
        .eq('id', parseInt(deviceId as string))
        .select()
        .single();

      if (deleteDeviceError) {
        console.error('Devices API: Device delete error:', deleteDeviceError);
        
        // Handle specific database constraint errors
        if (deleteDeviceError.code === '23503') {
          return res.status(400).json({ 
            error: 'Cannot delete device',
            details: 'This device is referenced by other records and cannot be deleted',
            suggestion: 'Remove all references to this device before deletion'
          });
        } else if (deleteDeviceError.code === '23505') {
          return res.status(400).json({ 
            error: 'Cannot delete device',
            details: 'This device has unique constraints that prevent deletion',
            suggestion: 'Contact support for assistance with this deletion'
          });
        } else {
          return res.status(500).json({ error: 'Failed to delete device' });
        }
      }

      console.log('Device deleted:', deletedDevice.id);
      return res.status(200).json({ message: 'Device deleted successfully', device: deletedDevice });
    } catch (error) {
      console.error('Devices API: Error:', error);
      return res.status(500).json({ error: 'Failed to delete device' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ error: 'Method not allowed' });
} 