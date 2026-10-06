import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError.js';
import { env } from '../config/env.js';

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }

  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else {
    console.error('UNEXPECTED ERROR:', err);
    error = new AppError('Internal Server Error', 500);
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(env.NODE_ENV === 'development' &&
      err instanceof Error && { stack: err.stack }),
  });
};