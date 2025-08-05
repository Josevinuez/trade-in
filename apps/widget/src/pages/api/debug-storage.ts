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
        model: true
      }
    });

    // Get the latest device
    const latestDevice = await prisma.deviceModel.findFirst({
      where: { name: 'Test Storage Fix' },
      include: {
        storageOptions: true
      }
    });

    // Try to create a storage option manually
    let manualCreate = null;
    try {
      manualCreate = await prisma.deviceStorageOption.create({
        data: {
          modelId: 23,
          storage: 'Test Storage',
          excellentPrice: 100,
          goodPrice: 80,
          fairPrice: 60,
          poorPrice: 40,
        }
      });
    } catch (error) {
      manualCreate = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    res.status(200).json({
      storageOptions,
      latestDevice,
      manualCreate
    });

  } catch (error: any) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' });
  }
} 