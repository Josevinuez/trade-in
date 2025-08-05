import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { type } = req.query;

      switch (type) {
        case 'brands':
          const allBrands = await prisma.deviceBrand.findMany({
            orderBy: { name: 'asc' },
            include: {
              _count: {
                select: { deviceModels: true }
              }
            }
          });
          return res.status(200).json(allBrands);

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brand fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch brands' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { type, data } = req.body;

      switch (type) {
        case 'brand':
          const { name, logoUrl } = data;
          
          const newBrand = await prisma.deviceBrand.create({
            data: {
              name,
              logoUrl: logoUrl || null,
              isActive: true
            }
          });

          return res.status(201).json(newBrand);

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brand creation error:', error);
      return res.status(500).json({ error: 'Failed to create brand' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { type, data } = req.body;

      switch (type) {
        case 'brand':
          const { id, name, logoUrl, isActive } = data;
          
          const updatedBrand = await prisma.deviceBrand.update({
            where: { id: parseInt(id) },
            data: {
              name,
              logoUrl: logoUrl || null,
              isActive: isActive !== undefined ? isActive : true
            }
          });

          return res.status(200).json(updatedBrand);

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brand update error:', error);
      return res.status(500).json({ error: 'Failed to update brand' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 