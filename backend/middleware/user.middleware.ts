import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { findUserById } from '../modules/auth/auth.repo.js';

interface JwtPayload {
  userId: string;
}

export const user = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Not authorized. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Not authorized. No token provided.', 401);
    }

    let decoded: JwtPayload;

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

      if (
        typeof payload === 'string' ||
        typeof payload.userId !== 'string'
      ) {
        throw new Error('Malformed token payload');
      }

      decoded = { userId: payload.userId };
    } catch {
      throw new AppError('Invalid or expired token.', 401);
    }

    const existingUser = await findUserById(decoded.userId);

    if (!existingUser) {
      throw new AppError('User no longer exists.', 401);
    }

    req.user = { userId: existingUser.id };

    next();
  }
);