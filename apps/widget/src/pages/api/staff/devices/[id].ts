import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Device ID is required' });
  }

  if (req.method === 'PUT') {
    try {
      const { type, data } = req.body;
      
      switch (type) {
        case 'model':
          const { storageOptions, ...modelData } = req.body;
          const deviceData = modelData.data || modelData;
          
          console.log('Updating device:', id, 'with data:', deviceData);
          console.log('Storage options:', storageOptions);
          
          try {
            const model = await prisma.deviceModel.update({
              where: { id: parseInt(id as string) },
              data: {
                name: deviceData.name,
                modelNumber: deviceData.modelNumber,
                releaseYear: parseInt(deviceData.releaseYear),
                imageUrl: deviceData.imageUrl || null,
                categoryId: parseInt(deviceData.categoryId),
                brandId: parseInt(deviceData.brandId),
                displayOrder: parseInt(deviceData.displayOrder) || 0,
                isActive: deviceData.isActive !== undefined ? deviceData.isActive : true,
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
                where: { modelId: parseInt(id as string) }
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
                        modelId: parseInt(id as string),
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
            return res.status(500).json({ error: 'Failed to update device', details: error instanceof Error ? error.message : 'Unknown error' });
          }

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error) {
      console.error('Device update error:', error);
      return res.status(500).json({ error: 'Failed to update device', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      console.log('Deleting device:', id);

      // Check if there are any trade-in orders for this device
      const relatedOrders = await prisma.tradeInOrder.findMany({
        where: { deviceModelId: parseInt(id as string) }
      });

      if (relatedOrders.length > 0) {
        console.log(`Found ${relatedOrders.length} related orders for device ${id}`);
        return res.status(400).json({ 
          error: 'Cannot delete device', 
          details: `This device has ${relatedOrders.length} associated trade-in order(s). Please delete the orders first or deactivate the device instead.`,
          relatedOrdersCount: relatedOrders.length
        });
      }

      // Delete storage options first
      await prisma.deviceStorageOption.deleteMany({
        where: { modelId: parseInt(id as string) }
      });

      console.log('Deleted storage options for device:', id);

      // Delete the device
      const deletedDevice = await prisma.deviceModel.delete({
        where: { id: parseInt(id as string) }
      });

      console.log('Deleted device:', deletedDevice.id);

      return res.status(200).json({ message: 'Device deleted successfully' });
    } catch (error) {
      console.error('Device deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete device', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 