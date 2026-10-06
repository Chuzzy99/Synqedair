import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../utils/appError.js';
import {
  getMeService,
  googleLoginService,
  logoutAllService,
  logoutService,
  refreshTokenService,
} from './auth.service.js';
import type {
  GoogleLoginBody,
  RefreshTokenBody,
  LogoutBody,
} from '../auth/auth.validation.ts';

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.validatedBody as GoogleLoginBody;

  const result = await googleLoginService(idToken);

  return sendResponse(res, 200, 'Login successful.', result);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.validatedBody as RefreshTokenBody;

  const tokens = await refreshTokenService(refreshToken);

  return sendResponse(res, 200, 'Token refreshed.', tokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.validatedBody as LogoutBody;

  await logoutService(refreshToken);

  return sendResponse(res, 200, 'Logged out successfully.');
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authorized.', 401);
  }

  await logoutAllService(req.user.userId);

  return sendResponse(res, 200, 'Logged out of all devices.');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authorized.', 401);
  }

  const user = await getMeService(req.user.userId);

  return sendResponse(res, 200, 'User fetched.', user);
});