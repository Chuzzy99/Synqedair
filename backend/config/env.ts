import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),

  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),

  // One or more origins, comma separated. The first one is also used as the payment return URL
  CLIENT_URL: z
    .string()
    .min(1, 'CLIENT_URL is required')
    .transform((value) =>
      value
        .split(',')
        .map((url) => url.trim().replace(/\/$/, ''))
        .filter(Boolean),
    )
    .pipe(z.array(z.string().url()).min(1)),

  // Payments
  PAYSTACK_SECRET_KEY: z.string().min(1, 'PAYSTACK_SECRET_KEY is required'),
  EXCHANGE_RATE_API_KEY: z.string().min(1, 'EXCHANGE_RATE_API_KEY is required'),
  FX_MARGIN_PERCENT: z.coerce.number().min(0).max(20).default(2),
  FX_CACHE_MINUTES: z.coerce.number().positive().default(60),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;