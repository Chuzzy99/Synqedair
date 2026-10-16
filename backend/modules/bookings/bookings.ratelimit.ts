import { rateLimit } from 'express-rate-limit'
import { AppError } from '../../utils/appError.js'

// Each init call hits Duffel, the exchange rate API and Paystack, so keep it tight per IP
export const initBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError('Too many payment attempts. Please try again in a few minutes.', 429))
  },
})