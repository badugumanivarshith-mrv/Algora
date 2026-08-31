import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from the root of backend folder
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().default('dev_secret_key_for_algora_ai_change_in_production'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  EMAIL_PROVIDER: z.enum(['resend', 'mock']).default('mock'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('onboarding@resend.dev'),
}).superRefine((data, ctx) => {
  if (data.EMAIL_PROVIDER === 'resend') {
    if (!data.RESEND_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['RESEND_API_KEY'],
        message: 'RESEND_API_KEY is required when EMAIL_PROVIDER is resend',
      });
    } else if (!data.RESEND_API_KEY.startsWith('re_')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['RESEND_API_KEY'],
        message: 'RESEND_API_KEY must start with "re_" in production-ready mode',
      });
    }
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type EnvConfig = z.infer<typeof envSchema>;
