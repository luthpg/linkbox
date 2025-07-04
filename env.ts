import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    CONVEX_DEPLOYMENT: z.string().min(1).optional(), // not for used
    CLERK_SECRET_KEY: z.string().min(1).optional(), // not for used
    CLERK_WEBHOOK_SECRET: z.string().min(1).optional(), // for convex http action
  },
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string().url().min(1),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_CLERK_FRONTEND_API_URL: z.string().url().min(1).optional(), // for convex http action
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_FRONTEND_API_URL:
      process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL,
  },
  emptyStringAsUndefined: true,
});
