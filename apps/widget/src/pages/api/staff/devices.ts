import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { type } = req.query;

      switch (type) {
        case 'categories':
          const categoriesData = await prisma.deviceCategory.findMany({
            orderBy: { name: 'asc' }
          });
          return res.status(200).json(categoriesData);

        case 'brands':
          const brandsData = await prisma.deviceBrand.findMany({
            orderBy: { name: 'asc' }
          });
          return res.status(200).json(brandsData);

        case 'conditions':
          const conditionsData = await prisma.deviceCondition.findMany({
            orderBy: { priceMultiplier: 'desc' }
          });
          return res.status(200).json(conditionsData);

        case 'models':
          try {
            const modelsData = await prisma.deviceModel.findMany({
              include: {
                category: true,
                brand: true,
                storageOptions: {
                  where: { isActive: true },
                  orderBy: { storage: 'asc' }
                },
              },
              orderBy: { name: 'asc' }
            });
            return res.status(200).json(modelsData);
          } catch (error) {
            console.error('Models fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch models' });
          }

        default:
          const [categories, brands, conditions, models] = await Promise.all([
            prisma.deviceCategory.findMany({
              orderBy: { name: 'asc' }
            }),
            prisma.deviceBrand.findMany({
              orderBy: { name: 'asc' }
            }),
            prisma.deviceCondition.findMany({
              orderBy: { priceMultiplier: 'desc' }
            }),
            prisma.deviceModel.findMany({
              include: {
                category: true,
                brand: true,
                storageOptions: {
                  where: { isActive: true },
                  orderBy: { storage: 'asc' }
                },
              },
              orderBy: { name: 'asc' }
            })
          ]);

          return res.status(200).json({
            categories,
            brands,
            conditions,
            models
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
          const category = await prisma.deviceCategory.create({
            data: {
              name: data.name,
              description: data.description,
              icon: data.icon,
            }
          });
          return res.status(201).json(category);

        case 'brand':
          const brand = await prisma.deviceBrand.create({
            data: {
              name: data.name,
              logoUrl: data.logoUrl,
            }
          });
          return res.status(201).json(brand);

        case 'condition':
          const condition = await prisma.deviceCondition.create({
            data: {
              name: data.name,
              description: data.description,
              priceMultiplier: parseFloat(data.priceMultiplier),
            }
          });
          return res.status(201).json(condition);

        case 'model':
          const { storageOptions, ...modelData } = req.body;
          const deviceData = modelData.data || modelData;
          
          console.log('Creating device with data:', deviceData);
          console.log('Storage options:', storageOptions);
          
          try {
            const model = await prisma.deviceModel.create({
              data: {
                name: deviceData.name,
                modelNumber: deviceData.modelNumber,
                releaseYear: parseInt(deviceData.releaseYear),
                imageUrl: deviceData.imageUrl || null,
                categoryId: parseInt(deviceData.categoryId),
                brandId: parseInt(deviceData.brandId),
                displayOrder: parseInt(deviceData.displayOrder) || 0,
              },
              include: {
                category: true,
                brand: true,
              }
            });

            console.log('Device created:', model.id);

            // Create storage options if provided
            if (storageOptions && storageOptions.length > 0) {
              console.log('Creating storage options:', storageOptions);
              
              for (const option of storageOptions) {
                console.log('Processing option:', option);
                if (option.storage && option.conditionPricing) {
                  console.log('Creating storage option:', option.storage);
                  
                  try {
                    // Create storage option with condition pricing
                    const storageOption = await prisma.deviceStorageOption.create({
                      data: {
                        modelId: model.id,
                        storage: option.storage,
                        excellentPrice: parseFloat(option.conditionPricing.excellent || '0'),
                        goodPrice: parseFloat(option.conditionPricing.good || '0'),
                        fairPrice: parseFloat(option.conditionPricing.fair || '0'),
                        poorPrice: parseFloat(option.conditionPricing.poor || '0'),
                      }
                    });

                    console.log('Storage option created:', storageOption);
                  } catch (storageError) {
                    console.error('Storage option creation failed:', storageError);
                  }
                } else {
                  console.log('Skipping option - missing storage or conditionPricing');
                }
              }
            } else {
              console.log('No storage options provided');
            }

            return res.status(201).json(model);
          } catch (error) {
            console.error('Device creation error:', error);
            return res.status(500).json({ error: 'Failed to create device', details: error.message });
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
          const category = await prisma.deviceCategory.update({
            where: { id: parseInt(deviceId) },
            data: {
              name: data.name,
              description: data.description,
              icon: data.icon,
              isActive: data.isActive,
            }
          });
          return res.status(200).json(category);

        case 'brand':
          const brand = await prisma.deviceBrand.update({
            where: { id: parseInt(deviceId) },
            data: {
              name: data.name,
              logoUrl: data.logoUrl,
              isActive: data.isActive,
            }
          });
          return res.status(200).json(brand);

        case 'condition':
          const condition = await prisma.deviceCondition.update({
            where: { id: parseInt(deviceId) },
            data: {
              name: data.name,
              description: data.description,
              priceMultiplier: parseFloat(data.priceMultiplier),
              isActive: data.isActive,
            }
          });
          return res.status(200).json(condition);

        case 'model':
          const { storageOptions, ...modelData } = req.body;
          const deviceData = modelData.data || modelData;
          
          console.log('Updating device:', deviceId, 'with data:', deviceData);
          console.log('Storage options:', storageOptions);
          
          try {
            const model = await prisma.deviceModel.update({
              where: { id: parseInt(deviceId) },
              data: {
                name: deviceData.name,
                modelNumber: deviceData.modelNumber,
                releaseYear: parseInt(deviceData.releaseYear),
                imageUrl: deviceData.imageUrl || null,
                categoryId: parseInt(deviceData.categoryId),
                brandId: parseInt(deviceData.brandId),
                displayOrder: parseInt(deviceData.displayOrder) || 0,
              },
              include: {
                category: true,
                brand: true,
              }
            });

            console.log('Device updated:', model.id);

            // Handle storage options update
            if (storageOptions && storageOptions.length > 0) {
              console.log('Updating storage options:', storageOptions);
              
              // Delete existing storage options for this model
              await prisma.deviceStorageOption.deleteMany({
                where: { modelId: parseInt(deviceId) }
              });

              console.log('Deleted existing storage options');

              // Create new storage options
              for (const option of storageOptions) {
                console.log('Processing option:', option);
                if (option.storage && option.conditionPricing) {
                  console.log('Creating storage option:', option.storage);
                  
                  try {
                    // Create storage option with direct pricing
                    const storageOption = await prisma.deviceStorageOption.create({
                      data: {
                        modelId: parseInt(deviceId),
                        storage: option.storage,
                        excellentPrice: parseFloat(option.conditionPricing.excellent || '0'),
                        goodPrice: parseFloat(option.conditionPricing.good || '0'),
                        fairPrice: parseFloat(option.conditionPricing.fair || '0'),
                        poorPrice: parseFloat(option.conditionPricing.poor || '0'),
                      }
                    });

                    console.log('Storage option created:', storageOption);
                  } catch (storageError) {
                    console.error('Storage option creation failed:', storageError);
                  }
                } else {
                  console.log('Skipping option - missing storage or conditionPricing');
                }
              }
            } else {
              console.log('No storage options provided for update');
            }

            return res.status(200).json(model);
          } catch (error) {
            console.error('Device update error:', error);
            return res.status(500).json({ error: 'Failed to update device', details: error.message });
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
      await prisma.deviceStorageOption.deleteMany({
        where: { modelId: parseInt(deviceId as string) }
      });

      console.log('Deleted storage options for device:', deviceId);

      // Delete the device
      const deletedDevice = await prisma.deviceModel.delete({
        where: { id: parseInt(deviceId as string) }
      });

      console.log('Deleted device:', deletedDevice.id);

      return res.status(200).json({ message: 'Device deleted successfully' });
    } catch (error) {
      console.error('Device deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete device', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 