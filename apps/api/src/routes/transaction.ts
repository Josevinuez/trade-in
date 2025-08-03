import { Router } from 'express';
import { AppDataSource } from '../index';
import { Transaction } from '../entities/Transaction';
import { Quote } from '../entities/Quote';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createTransactionSchema = z.object({
  quoteId: z.string(),
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string(),
  }),
});

const updateTransactionSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  finalPrice: z.number().positive().optional(),
  completedAt: z.string().datetime().optional(),
});

// Create transaction
router.post('/', async (req, res) => {
  try {
    const transactionRepository = AppDataSource.getRepository(Transaction);
    const quoteRepository = AppDataSource.getRepository(Quote);
    const validatedData = createTransactionSchema.parse(req.body);

    const quote = await quoteRepository.findOneBy({ id: validatedData.quoteId });
    if (!quote) {
      return res.status(404).json({
        error: {
          message: 'Quote not found',
          code: 'NOT_FOUND',
        },
      });
    }

    const transaction = transactionRepository.create({
      ...validatedData,
      status: 'pending',
      finalPrice: quote.price,
    });

    const savedTransaction = await transactionRepository.save(transaction);
    res.status(201).json({ data: savedTransaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid transaction data',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }
    console.error('Error creating transaction:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create transaction',
        code: 'CREATE_ERROR',
      },
    });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transactionRepository = AppDataSource.getRepository(Transaction);
    const transaction = await transactionRepository.findOneBy({ id: req.params.id });
    if (!transaction) {
      return res.status(404).json({
        error: {
          message: 'Transaction not found',
          code: 'NOT_FOUND',
        },
      });
    }
    res.json({ data: transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch transaction',
        code: 'FETCH_ERROR',
      },
    });
  }
});

// Update transaction
router.patch('/:id', async (req, res) => {
  try {
    const transactionRepository = AppDataSource.getRepository(Transaction);
    const transaction = await transactionRepository.findOneBy({ id: req.params.id });
    if (!transaction) {
      return res.status(404).json({
        error: {
          message: 'Transaction not found',
          code: 'NOT_FOUND',
        },
      });
    }

    const validatedData = updateTransactionSchema.parse(req.body);
    const updatedTransaction = await transactionRepository.save({
      ...transaction,
      ...validatedData,
    });

    res.json({ data: updatedTransaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Invalid transaction data',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }
    console.error('Error updating transaction:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update transaction',
        code: 'UPDATE_ERROR',
      },
    });
  }
});

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactionRepository = AppDataSource.getRepository(Transaction);
    const { status, startDate, endDate } = req.query;
    const queryBuilder = transactionRepository.createQueryBuilder('transaction');

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }
    if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    const transactions = await queryBuilder.getMany();
    res.json({ data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch transactions',
        code: 'FETCH_ERROR',
      },
    });
  }
});

export const transactionRouter = router; 