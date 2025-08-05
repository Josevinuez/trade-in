import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [categories, brands, conditions, models] = await Promise.all([
      prisma.deviceCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }),
      prisma.deviceBrand.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      }),
      prisma.deviceCondition.findMany({
        where: { isActive: true },
        orderBy: { priceMultiplier: 'desc' }
      }),
      prisma.deviceModel.findMany({
        where: { isActive: true },
        include: {
          category: true,
          brand: true,
          storageOptions: {
            orderBy: { storage: 'asc' }
          },
        },
        orderBy: { name: 'asc' }
      })
    ]);

    res.status(200).json({
      categories,
      brands,
      conditions,
      models
    });

  } catch (error) {
    console.error('Device catalog error:', error);
    res.status(500).json({ error: 'Failed to fetch device catalog' });
  }
} 