import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
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

// Security & parsing middleware
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser clients
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(hpp());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Basic rate limiter for all routes
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  limit: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Initialize TypeORM DataSource
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || 5432);
const dbUser = process.env.DB_USER || 'cursor';
const dbPassword = process.env.DB_PASSWORD || 'cursor2025';
const dbName = process.env.DB_NAME || 'device_buyback';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,
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
    console.log('Connecting to Postgres', {
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
    });
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