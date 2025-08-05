import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const [orders, totalCount] = await Promise.all([
      prisma.tradeInOrder.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          },
          deviceModel: {
            include: {
              brand: true,
              category: true,
            }
          },
          deviceCondition: true,
          shippingLabels: true,
          payments: {
            include: {
              paymentMethod: true,
            }
          },
          orderStatusHistory: {
            orderBy: {
              updatedAt: 'desc'
            },
            take: 1,
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum,
      }),
      prisma.tradeInOrder.count({
        where: whereClause,
      })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      }
    });

  } catch (error) {
    console.error('Staff orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
} 