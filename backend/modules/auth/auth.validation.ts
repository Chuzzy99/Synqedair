import { z } from 'zod';

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
});

export const logoutSchema = refreshTokenSchema;

export type GoogleLoginBody = z.infer<typeof googleLoginSchema>;
export type RefreshTokenBody = z.infer<typeof refreshTokenSchema>;
export type LogoutBody = z.infer<typeof logoutSchema>;