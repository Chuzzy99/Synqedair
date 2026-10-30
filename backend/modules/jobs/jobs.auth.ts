import { createHash, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/appError.js'

// Hash both sides first, so the two buffers are always the same length
// and the comparison takes the same time whatever the guess was
const sha256 = (value: string) => createHash('sha256').update(value).digest()

const isValidSecret = (candidate: string) => timingSafeEqual(sha256(candidate), sha256(env.JOBS_SECRET))

// Expects:  Authorization: Bearer <JOBS_SECRET>
export const requireJobsSecret = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''

  if (!token || !isValidSecret(token)) {
    next(new AppError('Unauthorized', 401))
    return
  }

  next()
}

// This route skips the global limiter (cron calls it every minute), so it gets its own.
// Only FAILED attempts count, which stops secret guessing without ever blocking the real cron
export const jobsFailedAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError('Too many attempts. Please try again later.', 429))
  },
})