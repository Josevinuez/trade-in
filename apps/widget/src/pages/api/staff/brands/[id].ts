import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Brand ID is required' });
  }

  if (req.method === 'PUT') {
    try {
      const { type, data } = req.body;

      switch (type) {
        case 'brand':
          const { name, logoUrl, isActive } = data;

          console.log('Updating brand:', id, 'with data:', { name, logoUrl, isActive });

          try {
            const brand = await prisma.deviceBrand.update({
              where: { id: parseInt(id as string) },
              data: {
                name,
                logoUrl: logoUrl || null,
                isActive: isActive !== undefined ? isActive : true,
              }
            });

            console.log('Brand updated:', brand.id);
            return res.status(200).json(brand);
          } catch (error: any) {
            console.error('Brand update error:', error);
            return res.status(500).json({ error: 'Failed to update brand', details: error.message });
          }

        default:
          return res.status(400).json({ error: 'Invalid type' });
      }
    } catch (error: any) {
      console.error('Brand update error:', error);
      return res.status(500).json({ error: 'Failed to update brand' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      console.log('Deleting brand:', id);

      // Check if there are any device models for this brand
      const relatedModels = await prisma.deviceModel.findMany({
        where: { brandId: parseInt(id as string) }
      });

      if (relatedModels.length > 0) {
        console.log(`Found ${relatedModels.length} related models for brand ${id}`);
        return res.status(400).json({
          error: 'Cannot delete brand',
          details: `This brand has ${relatedModels.length} associated device model(s). Please delete the models first or deactivate the brand instead.`,
          relatedModelsCount: relatedModels.length
        });
      }

      // Delete the brand
      const deletedBrand = await prisma.deviceBrand.delete({
        where: { id: parseInt(id as string) }
      });

      console.log('Deleted brand:', deletedBrand.id);

      return res.status(200).json({ message: 'Brand deleted successfully' });
    } catch (error: any) {
      console.error('Brand deletion error:', error);

      // Check if it's a foreign key constraint error
      if (error.code === 'P2003') {
        return res.status(400).json({
          error: 'Cannot delete brand',
          details: 'This brand has associated device models. Please delete the models first or deactivate the brand instead.',
          code: 'FOREIGN_KEY_CONSTRAINT'
        });
      }

      return res.status(500).json({ error: 'Failed to delete brand', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 