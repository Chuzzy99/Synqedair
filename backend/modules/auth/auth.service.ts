import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';
import {
  createGoogleUser,
  deleteAllUserRefreshTokens,
  deleteRefreshToken,
  findRefreshToken,
  findUserByEmail,
  findUserById,
  findUserByGoogleId,
  linkGoogleToUser,
  saveRefreshToken,
  shortenRefreshToken,
} from '../auth/auth.repo.js';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

type ExpiresIn = NonNullable<SignOptions['expiresIn']>;

// After a refresh, the old token stays valid this long, so a lost response
// (page reload mid-request) doesn't log the user out
const REFRESH_GRACE_MS = 60 * 1000;

/* ---------- Helpers ---------- */

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

const signAccessToken = (userId: string) =>
  jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as ExpiresIn,
  });

const issueTokens = async (userId: string) => {
  const accessToken = signAccessToken(userId);

  const refreshToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  await saveRefreshToken({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  return { accessToken, refreshToken };
};

const toPublicUser = (user: {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  avatar: user.avatar,
});

const verifyGoogleIdToken = async (idToken: string) => {
  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError('Invalid Google token.', 401);
  }

  if (!payload || !payload.sub || !payload.email) {
    throw new AppError('Invalid Google token.', 401);
  }

  // Critical: we link accounts by email, so Google must have verified it
  if (!payload.email_verified) {
    throw new AppError('Google email is not verified.', 401);
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name ?? null,
    avatar: payload.picture ?? null,
  };
};

/* ---------- Services ---------- */

export const googleLoginService = async (idToken: string) => {
  const profile = await verifyGoogleIdToken(idToken);

  let user = await findUserByGoogleId(profile.googleId);

  if (!user) {
    const existing = await findUserByEmail(profile.email);

    user = existing
      ? await linkGoogleToUser(existing.id, {
          googleId: profile.googleId,
          name: profile.name,
          avatar: profile.avatar,
        })
      : await createGoogleUser({
          email: profile.email,
          googleId: profile.googleId,
          name: profile.name,
          avatar: profile.avatar,
          emailVerified: true,
        });
  }

  const tokens = await issueTokens(user.id);

  return { user: toPublicUser(user), ...tokens };
};

export const refreshTokenService = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken);
  const stored = await findRefreshToken(tokenHash);

  if (!stored) {
    throw new AppError('Invalid refresh token.', 401);
  }

  if (stored.expiresAt < new Date()) {
    await deleteRefreshToken(tokenHash);
    throw new AppError('Refresh token expired.', 401);
  }

  const user = await findUserById(stored.userId);

  if (!user) {
    await deleteRefreshToken(tokenHash);
    throw new AppError('User no longer exists.', 401);
  }

  // Rotation with a grace window: the old token dies shortly, not instantly
  await shortenRefreshToken(tokenHash, new Date(Date.now() + REFRESH_GRACE_MS));

  return issueTokens(user.id);
};

export const logoutService = async (refreshToken: string) => {
  await deleteRefreshToken(hashToken(refreshToken));
};

export const logoutAllService = async (userId: string) => {
  await deleteAllUserRefreshTokens(userId);
};

export const getMeService = async (userId: string) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return toPublicUser(user);
};