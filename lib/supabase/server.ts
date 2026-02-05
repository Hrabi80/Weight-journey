import { cookies, headers } from "next/headers";
import { createServerClient, type CookieOptions, type SupabaseClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Creates a Supabase server client that:
 * - Honors the Authorization header when present (so API routes can act on behalf of the user).
 * - Persists auth cookies using Next.js' request/response cookies helper.
 */
export function createSupabaseServerClient(): SupabaseClient<Database> {
  const cookieStore = cookies();
  const requestHeaders = headers();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    headers: {
      // Forward Authorization header (Bearer access_token) when provided by the client.
      Authorization: requestHeaders.get("Authorization") ?? undefined,
    },
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}

