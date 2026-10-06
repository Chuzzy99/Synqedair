import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';

/* ---------- Users ---------- */

export const findUserById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email: email.toLowerCase() } });

export const findUserByGoogleId = (googleId: string) =>
  prisma.user.findUnique({ where: { googleId } });

export const createGoogleUser = (data: {
  email: string;
  googleId: string;
  name: string | null;
  avatar: string | null;
  emailVerified: boolean;
}) =>
  prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      googleId: data.googleId,
      name: data.name,
      avatar: data.avatar,
      emailVerified: data.emailVerified,
      provider: 'GOOGLE',
    },
  });

// Existing user (same email) signing in with Google for the first time
export const linkGoogleToUser = (
  userId: string,
  data: { googleId: string; name: string | null; avatar: string | null }
) => {
  const updateData: Prisma.UserUpdateInput = {
    googleId: data.googleId,
    emailVerified: true,
  };

  if (data.name) updateData.name = data.name;
  if (data.avatar) updateData.avatar = data.avatar;

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

/* ---------- Refresh tokens ---------- */

export const saveRefreshToken = (data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) => prisma.refreshToken.create({ data });

export const findRefreshToken = (tokenHash: string) =>
  prisma.refreshToken.findUnique({ where: { tokenHash } });

export const deleteRefreshToken = (tokenHash: string) =>
  prisma.refreshToken.deleteMany({ where: { tokenHash } });

export const deleteAllUserRefreshTokens = (userId: string) =>
  prisma.refreshToken.deleteMany({ where: { userId } });

// Shortens a token's life to `expiresAt`, never extends it
export const shortenRefreshToken = (tokenHash: string, expiresAt: Date) =>
  prisma.refreshToken.updateMany({
    where: { tokenHash, expiresAt: { gt: expiresAt } },
    data: { expiresAt },
  });