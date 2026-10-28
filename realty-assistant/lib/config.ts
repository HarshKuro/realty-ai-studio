import { z } from 'zod';

const EnvSchema = z.object({
  KOKORO_BASE_URL: z.string().url().default('http://127.0.0.1:8880/v1'),
  WHISPER_BASE_URL: z.string().url().default('http://127.0.0.1:8881/v1'),
  RENDER_TIMEOUT_MS: z.coerce.number().default(120000),
  DEFAULT_ASPECT_RATIO: z.enum(['9:16', '16:9']).default('9:16'),
  RENDER_OUTPUT_DIR: z.string().default('./public/renders'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = EnvSchema.safeParse({
  KOKORO_BASE_URL: process.env.KOKORO_BASE_URL || 'http://127.0.0.1:8880/v1',
  WHISPER_BASE_URL: process.env.WHISPER_BASE_URL || 'http://127.0.0.1:8881/v1',
  RENDER_TIMEOUT_MS: process.env.RENDER_TIMEOUT_MS || '120000',
  DEFAULT_ASPECT_RATIO: process.env.DEFAULT_ASPECT_RATIO || '9:16',
  RENDER_OUTPUT_DIR: process.env.RENDER_OUTPUT_DIR || './public/renders',
  NODE_ENV: process.env.NODE_ENV || 'development',
});

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const envConfig = {
  kokoroBaseUrl: parsed.data.KOKORO_BASE_URL,
  whisperBaseUrl: parsed.data.WHISPER_BASE_URL,
  renderTimeoutMs: parsed.data.RENDER_TIMEOUT_MS,
  defaultAspectRatio: parsed.data.DEFAULT_ASPECT_RATIO,
  renderOutputDir: parsed.data.RENDER_OUTPUT_DIR,
  isProduction: parsed.data.NODE_ENV === 'production',
};

