import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  if (req.method === 'PUT') {
    try {
      const { status, trackingNumber, notes, paymentMethod } = req.body;

      console.log('Updating order:', id, 'with data:', { status, trackingNumber, notes, paymentMethod });

      const updateData: any = {
        status,
        notes: notes || null,
      };

      // Add payment method if provided
      if (paymentMethod !== undefined) {
        updateData.paymentMethod = paymentMethod || null;
      }

      // If status is COMPLETED, set completedAt
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }

      const updatedOrder = await prisma.tradeInOrder.update({
        where: { id: parseInt(id as string) },
        data: updateData,
        include: {
          customer: true,
          deviceModel: {
            include: {
              brand: true,
              category: true,
            }
          },
          deviceCondition: true,
          shippingLabels: true,
          payments: true,
        }
      });

      // Handle tracking number update
      if (trackingNumber) {
        // Check if shipping label exists
        const existingLabel = await prisma.shippingLabel.findFirst({
          where: { orderId: parseInt(id as string) }
        });

        if (existingLabel) {
          // Update existing shipping label
          await prisma.shippingLabel.update({
            where: { id: existingLabel.id },
            data: { trackingNumber }
          });
        } else {
          // Create new shipping label
          await prisma.shippingLabel.create({
            data: {
              orderId: parseInt(id as string),
              trackingNumber,
              carrier: 'Standard Shipping'
            }
          });
        }
      }

      console.log('Order updated successfully:', updatedOrder.id);

      return res.status(200).json(updatedOrder);
    } catch (error: any) {
      console.error('Order update error:', error);
      return res.status(500).json({ error: 'Failed to update order', details: error.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const order = await prisma.tradeInOrder.findUnique({
        where: { id: parseInt(id as string) },
        include: {
          customer: true,
          deviceModel: {
            include: {
              brand: true,
              category: true,
            }
          },
          deviceCondition: true,
          shippingLabels: true,
          payments: true,
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.status(200).json(order);
    } catch (error: any) {
      console.error('Order fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch order', details: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      console.log('Deleting order:', id);

      // Check if order exists
      const order = await prisma.tradeInOrder.findUnique({
        where: { id: parseInt(id as string) }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Delete related records first (shipping labels, payments, etc.)
      await prisma.shippingLabel.deleteMany({
        where: { orderId: parseInt(id as string) }
      });

      await prisma.payment.deleteMany({
        where: { orderId: parseInt(id as string) }
      });

      await prisma.customerMessage.deleteMany({
        where: { orderId: parseInt(id as string) }
      });

      await prisma.orderStatusHistory.deleteMany({
        where: { orderId: parseInt(id as string) }
      });

      // Delete the order
      await prisma.tradeInOrder.delete({
        where: { id: parseInt(id as string) }
      });

      console.log('Order deleted successfully:', id);

      return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error: any) {
      console.error('Order deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete order', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 