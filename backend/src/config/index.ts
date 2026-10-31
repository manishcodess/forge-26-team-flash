import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default('resqflow_super_secure_jwt_secret_key_2026_forge'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().optional(),
  OPEN_METEO_BASE_URL: z.string().default('https://api.open-meteo.com/v1'),
  OSRM_BASE_URL: z.string().default('https://router.project-osrm.org'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
