import express from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { deviceRouter } from './routes/device';
import { quoteRouter } from './routes/quote';
import { pricingRouter } from './routes/pricing';
import { transactionRouter } from './routes/transaction';
import { Device } from './entities/Device';
import { Quote } from './entities/Quote';
import { Transaction } from './entities/Transaction';
import { User } from './entities/User';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize TypeORM DataSource
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'cursor',
  password: 'cursor2025',
  database: 'device_buyback',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [Device, Quote, Transaction, User],
});

// Routes
app.use('/api/devices', deviceRouter);
app.use('/api/quotes', quoteRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/transactions', transactionRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
});

// Initialize database connection and start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');
    console.log('TypeORM synchronize:', AppDataSource.options.synchronize);
    console.log('Loaded entities:', AppDataSource.entityMetadatas.map(e => e.name));

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  }
}

startServer(); 