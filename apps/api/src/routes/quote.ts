import { Router } from 'express';
import { AppDataSource } from '../index';
import { Quote } from '../entities/Quote';
import { Device } from '../entities/Device';
import { z } from 'zod';
import { DeviceCondition, StorageOption } from '@device-buyback/types';

const router = Router();

// Validation schemas
const createQuoteSchema = z.object({
  deviceId: z.string(),
  storage: z.enum(['64GB', '128GB', '256GB', '512GB', '1TB']),
  condition: z.enum(['like-new', 'good', 'fair', 'poor']),
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }).optional(),
});

// Calculate quote
router.post('/calculate', async (req, res) => {
  try {
    const quoteRepository = AppDataSource.getRepository(Quote);
    const deviceRepository = AppDataSource.getRepository(Device);
    const { deviceId, storage, condition } = req.body;

    const device = await deviceRepository.findOneBy({ id: deviceId });
    if (!device) {
      return res.status(404).json({
        error: {
          message: 'Device not found',
          code: 'NOT_FOUND',
        },
      });
    }

    const basePrice = device.basePrice;
    const conditionMultiplier = device.conditionMultipliers[condition as DeviceCondition];
    const storageMultiplier = device.storageMultipliers[storage as StorageOption];

    const price = basePrice * conditionMultiplier * storageMultiplier;

    res.json({
      data: {
        price,
        device: {
          id: device.id,
          type: device.type,
          brand: device.brand,
          model: device.model,
        },
      },
    });
  } catch (error) {
    console.error('Error calculating quote:', error);
    res.status(500).json({
      error: {
        message: 'Failed to calculate quote',
        code: 'CALCULATION_ERROR',
      },
    });
  }
});

// Create quote
router.post('/', async (req, res) => {
  try {
    const quoteRepository = AppDataSource.getRepository(Quote);
    const deviceRepository = AppDataSource.getRepository(Device);
    const validatedData = createQuoteSchema.parse(req.body);

    const device = await deviceRepository.findOneBy({ id: validatedData.deviceId });
    if (!device) {
      return res.status(404).json({
        error: {
          message: 'Device not found',
          code: 'NOT_FOUND',
        },
      });
    }

    const basePrice = device.basePrice;
    const conditionMultiplier = device.conditionMultipliers[validatedData.condition as DeviceCondition];
    const storageMultiplier = device.storageMultipliers[validatedData.storage as StorageOption];

    const price = basePrice * conditionMultiplier * storageMultiplier;

    const quote = quoteRepository.create({
      ...validatedData,
      price,
    });

    const savedQuote = await quoteRepository.save(quote);
    res.status(201).json({ data: savedQuote });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid quote data',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }
    console.error('Error creating quote:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create quote',
        code: 'CREATE_ERROR',
      },
    });
  }
});

// Get quote by ID
router.get('/:id', async (req, res) => {
  try {
    const quoteRepository = AppDataSource.getRepository(Quote);
    const quote = await quoteRepository.findOneBy({ id: req.params.id });
    if (!quote) {
      return res.status(404).json({
        error: {
          message: 'Quote not found',
          code: 'NOT_FOUND',
        },
      });
    }
    res.json({ data: quote });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch quote',
        code: 'FETCH_ERROR',
      },
    });
  }
});

export const quoteRouter = router; 