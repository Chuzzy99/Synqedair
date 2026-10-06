import { Router } from 'express';
import { validate } from '../../middleware/validateMiddleware.js';
import { user } from '../../middleware/user.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimiterMiddleware.js';
import {
  getMe,
  googleLogin,
  logout,
  logoutAll,
  refreshToken,
} from './auth.controller.js';
import {
  googleLoginSchema,
  logoutSchema,
  refreshTokenSchema,
} from './auth.validation.js';

const router = Router();

router.post(
  '/google',
  authRateLimiter,
  validate({ body: googleLoginSchema }),
  googleLogin
);

router.post('/refresh', validate({ body: refreshTokenSchema }), refreshToken);

router.post('/logout', validate({ body: logoutSchema }), logout);

router.post('/logout-all', user, logoutAll);

router.get('/me', user, getMe);

export default router;