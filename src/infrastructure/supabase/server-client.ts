import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SetAllCookies } from "@supabase/ssr";

/**
 * Creates a Supabase client configured for Next.js Server Components / Route Handlers.
 *
 * Notes:
 * - This client uses cookies to read the current session.
 * - It can also write updated auth cookies when running in environments that allow it.
 * - The Application layer MUST NOT import this file.
 */
export async function create_supabase_server_client(): Promise<SupabaseClient> {
  const cookie_store = await cookies();

  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabase_url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!supabase_key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable."
    );
  }

  return createServerClient(supabase_url, supabase_key, {
    cookies: {
      getAll() {
        return cookie_store.getAll();
      },
      setAll(cookies_to_set: Parameters<SetAllCookies>[0]) {
        try {
          cookies_to_set.forEach(({ name, value, options }) => {
            cookie_store.set(name, value, options as Parameters<typeof cookie_store.set>[2]);
          });
        } catch {
          // In some server contexts cookies can be read-only.
        }
      },
    },
  });
}

export const createSupabaseServerClient = create_supabase_server_client;
