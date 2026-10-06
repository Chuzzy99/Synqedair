import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';

import { env } from './config/env.js';
import { globalRateLimiter } from './middleware/rateLimiterMiddleware.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { AppError } from './utils/appError.js';

import authRoutes from './modules/auth/auth.routes.js';

const app = express();

// Required behind Render/Railway/Nginx so rate limiting sees the real client IP
app.set('trust proxy', 1);

app.use(helmet());
console.log(env.CLIENT_URL)
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));


app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(compression());
app.use(hpp());
app.use(globalRateLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

app.use('/api/v1/auth', authRoutes);

app.use((req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

app.use(errorMiddleware);

export default app;