import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, orderNumber } = req.body;

    if (!email || !orderNumber) {
      return res.status(400).json({ error: 'Email and order number are required' });
    }

    // Find the order by email and order number
    const order = await prisma.tradeInOrder.findFirst({
      where: {
        orderNumber: orderNumber,
        customer: {
          email: email
        }
      },
      include: {
        customer: true,
        deviceModel: {
          include: {
            brand: true,
            category: true,
          }
        },
        deviceCondition: true,
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found. Please check your email and order number.' });
    }

    // Format the response
    const orderStatus = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      quotedAmount: parseFloat(order.quotedAmount.toString()),
      finalAmount: order.finalAmount ? parseFloat(order.finalAmount.toString()) : undefined,
      submittedAt: order.submittedAt.toISOString(),
      processedAt: order.processedAt ? order.processedAt.toISOString() : undefined,
      completedAt: order.completedAt ? order.completedAt.toISOString() : undefined,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
      deviceModel: `${order.deviceModel.brand.name} ${order.deviceModel.name}`,
      deviceCondition: order.deviceCondition.name,
      notes: order.notes,
    };

    return res.status(200).json(orderStatus);
  } catch (error: any) {
    console.error('Order tracking error:', error);
    return res.status(500).json({ error: 'Failed to track order', details: error instanceof Error ? error.message : 'Unknown error' });
  }
} 