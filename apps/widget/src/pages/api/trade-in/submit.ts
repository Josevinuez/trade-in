import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      customerEmail,
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerProvince,
      customerPostalCode,
      deviceModelId,
      deviceConditionId,
      quotedAmount,
      paymentMethod,
      notes
    } = req.body;

    // Validate required fields
    if (!customerEmail || !customerName || !deviceModelId || !deviceConditionId || !quotedAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if customer exists, if not create them
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: customerEmail,
          firstName: customerName.split(' ')[0] || customerName,
          lastName: customerName.split(' ').slice(1).join(' ') || '',
          phone: customerPhone,
          addressLine1: customerAddress,
          city: customerCity,
          province: customerProvince,
          postalCode: customerPostalCode,
          passwordHash: 'temp-hash', // Will be updated when customer registers
        }
      });
    } else {
      // Update existing customer with address information
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          addressLine1: customerAddress,
          city: customerCity,
          province: customerProvince,
          postalCode: customerPostalCode,
        }
      });
    }

    // Generate unique order number
    const currentYear = new Date().getFullYear();
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `TI-${currentYear}-${timestamp}-${randomSuffix}`;

    // Create trade-in order
    const tradeInOrder = await prisma.tradeInOrder.create({
      data: {
        orderNumber,
        customerId: customer.id,
        deviceModelId: parseInt(deviceModelId),
        deviceConditionId: parseInt(deviceConditionId),
        quotedAmount: parseFloat(quotedAmount),
        status: 'PENDING',
        paymentMethod: paymentMethod || null,
        notes: notes || '',
      },
      include: {
        customer: true,
        deviceModel: {
          include: {
            brand: true,
            category: true,
          },
        },
        deviceCondition: true,
      },
    });

    // Create initial status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: tradeInOrder.id,
        status: 'PENDING',
        notes: 'Order created from trade-in form',
        updatedBy: 1, // Default to first staff member
      },
    });

    res.status(201).json({
      success: true,
      order: tradeInOrder,
      message: 'Trade-in order submitted successfully'
    });

  } catch (error) {
    console.error('Trade-in submission error:', error);
    res.status(500).json({ error: 'Failed to submit trade-in order' });
  }
} 