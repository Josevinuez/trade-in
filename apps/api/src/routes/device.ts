import { Router } from 'express';
import { AppDataSource } from '../index';
import { Device } from '../entities/Device';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Validation schemas
const createDeviceSchema = z.object({
  type: z.enum(['smartphone', 'tablet', 'laptop', 'smartwatch']),
  brand: z.enum(['apple', 'samsung', 'google', 'microsoft', 'other']),
  model: z.string(),
  storageOptions: z.array(z.enum(['64GB', '128GB', '256GB', '512GB', '1TB'])),
  basePrice: z.number().positive(),
  conditionMultipliers: z.record(z.enum(['like-new', 'good', 'fair', 'poor']), z.number()),
  storageMultipliers: z.record(z.enum(['64GB', '128GB', '256GB', '512GB', '1TB']), z.number()),
  imageUrl: z.string().url().optional(),
  releaseDate: z.string().optional(),
});

const updateDeviceSchema = createDeviceSchema.partial();

// Get all devices
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
    res.json({ data: devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch devices',
        code: 'FETCH_ERROR',
      },
    });
  }
});

// Get device by ID
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
    res.json({ data: device });
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch device',
        code: 'FETCH_ERROR',
      },
    });
  }
});

// Create new device
router.post('/', requireAuth(['admin']), async (req, res) => {
  try {
    const deviceRepository = AppDataSource.getRepository(Device);
    const validatedData = createDeviceSchema.parse(req.body);
    const device = deviceRepository.create(validatedData);
    const savedDevice = await deviceRepository.save(device);
    res.status(201).json({ data: savedDevice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid device data',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }
    console.error('Error creating device:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create device',
        code: 'CREATE_ERROR',
      },
    });
  }
});

// Update device
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

    const validatedData = updateDeviceSchema.parse(req.body);
    const updatedDevice = await deviceRepository.save({
      ...device,
      ...validatedData,
    });

    res.json({ data: updatedDevice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid device data',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }
    console.error('Error updating device:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update device',
        code: 'UPDATE_ERROR',
      },
    });
  }
});

// Delete device
router.delete('/:id', requireAuth(['admin']), async (req, res) => {
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

    await deviceRepository.remove(device);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete device',
        code: 'DELETE_ERROR',
      },
    });
  }
});

export const deviceRouter = router; 