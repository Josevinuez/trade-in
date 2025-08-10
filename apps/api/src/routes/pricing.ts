import { Router } from 'express';
import { AppDataSource } from '../index';
import { Device } from '../entities/Device';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Validation schemas
const updatePricingSchema = z.object({
  basePrice: z.number().positive().optional(),
  conditionMultipliers: z.record(z.enum(['like-new', 'good', 'fair', 'poor']), z.number()).optional(),
  storageMultipliers: z.record(z.enum(['64GB', '128GB', '256GB', '512GB', '1TB']), z.number()).optional(),
});

// Update device pricing
router.patch('/:id', requireAuth(['admin']), async (req, res) => {
  try {
    const deviceRepository = AppDataSource.getRepository(Device);
    const device = await deviceRepository.findOneBy({ id: req.params.id });
    if (!device) {
      return res.status(404).json({
        error: {
          message: 'Device not found',
          code: 'NOT_FOUND',
        },
      });
    }

    const validatedData = updatePricingSchema.parse(req.body);
    const updatedDevice = await deviceRepository.save({
      ...device,
      ...validatedData,
    });

    res.json({ data: updatedDevice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid pricing data',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }
    console.error('Error updating pricing:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update pricing',
        code: 'UPDATE_ERROR',
      },
    });
  }
});

// Get pricing for a device
router.get('/:id', async (req, res) => {
  try {
    const deviceRepository = AppDataSource.getRepository(Device);
    const device = await deviceRepository.findOneBy({ id: req.params.id });
    if (!device) {
      return res.status(404).json({
        error: {
          message: 'Device not found',
          code: 'NOT_FOUND',
        },
      });
    }

    const pricing = {
      basePrice: device.basePrice,
      conditionMultipliers: device.conditionMultipliers,
      storageMultipliers: device.storageMultipliers,
    };

    res.json({ data: pricing });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch pricing',
        code: 'FETCH_ERROR',
      },
    });
  }
});

// Get pricing for all devices
router.get('/', async (req, res) => {
  try {
    const deviceRepository = AppDataSource.getRepository(Device);
    const { type, brand } = req.query;
    const queryBuilder = deviceRepository.createQueryBuilder('device');

    if (type) {
      queryBuilder.andWhere('device.type = :type', { type });
    }
    if (brand) {
      queryBuilder.andWhere('device.brand = :brand', { brand });
    }

    const devices = await queryBuilder.getMany();
    const pricing = devices.map(device => ({
      id: device.id,
      type: device.type,
      brand: device.brand,
      model: device.model,
      basePrice: device.basePrice,
      conditionMultipliers: device.conditionMultipliers,
      storageMultipliers: device.storageMultipliers,
    }));

    res.json({ data: pricing });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch pricing',
        code: 'FETCH_ERROR',
      },
    });
  }
});

export const pricingRouter = router; 