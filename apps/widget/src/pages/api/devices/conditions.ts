import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const conditions = await prisma.deviceCondition.findMany({
      where: { isActive: true },
      orderBy: { priceMultiplier: 'desc' }
    });

    res.status(200).json({
      conditions
    });

  } catch (error) {
    console.error('Device conditions error:', error);
    res.status(500).json({ error: 'Failed to fetch device conditions' });
  }
} 