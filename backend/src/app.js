import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { registerEventListeners } from './events/eventListeners.js';

registerEventListeners();

export const createApp = () => {
  const app = express();

  app.use(helmet());

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
