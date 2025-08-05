import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const clients = await prisma.customer.findMany({
        where: { isActive: true },
        include: {
          tradeInOrders: {
            include: {
              deviceModel: {
                include: {
                  brand: true,
                  category: true,
                }
              },
              deviceCondition: true,
              shippingLabels: true,
              payments: true,
            },
            orderBy: { submittedAt: 'desc' }
          },
          _count: {
            select: { tradeInOrders: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json(clients);
    } catch (error: any) {
      console.error('Client fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch clients', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 