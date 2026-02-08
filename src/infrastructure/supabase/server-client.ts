import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client configured for Next.js Server Components / Route Handlers.
 *
 * Notes:
 * - This client uses cookies to read the current session.
 * - It can also write updated auth cookies when running in environments that allow it.
 * - The Application layer MUST NOT import this file.
 */
export function create_supabase_server_client() {
  const cookie_store = cookies();

  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabase_url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!supabase_key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable.");
  }
}