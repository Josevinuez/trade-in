import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all storage options
    const storageOptions = await prisma.deviceStorageOption.findMany({
      include: {
        conditionPricing: {
          include: {
            condition: true
          }
        }
      }
    });

    // Get all condition pricing
    const conditionPricing = await prisma.storageConditionPricing.findMany({
      include: {
        condition: true,
        storageOption: true
      }
    });

    // Get a specific device with storage options
    const device = await prisma.deviceModel.findFirst({
      where: { name: 'Debug Test' },
      include: {
        storageOptions: {
          include: {
            conditionPricing: {
              include: {
                condition: true
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      storageOptions,
      conditionPricing,
      device
    });

  } catch (error: any) {
    console.error('Test error:', error);
    res.status(500).json({ error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' });
  }
} 