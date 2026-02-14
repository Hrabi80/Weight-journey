import { z } from "zod";

const envSchema = z.object({
  DATABASE_kEY: z.string().min(1).optional(),
  SUPABASE_URL: z.string().min(1).optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_FORMSPREE_ID: z.string().optional(),
  WEB3FORMS_ACCESS_KEY: z.string().optional(),
  NODE_ENV: z.string().optional()
});

export const env = envSchema.parse({
  DATABASE_kEY: process.env.DATABASE_kEY,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  WEB3FORMS_ACCESS_KEY: process.env.WEB3FORMS_ACCESS_KEY,
  NODE_ENV: process.env.NODE_ENV,
});
