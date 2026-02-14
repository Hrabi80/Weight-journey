import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SetAllCookies } from "@supabase/ssr";
import { env } from "@/src/env";

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

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_PUBLISHABLE_KEY;
  // ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL environment variable.");
  }

  if (!supabaseKey) {
    throw new Error(
      "Missing SUPABASE_PUBLISHABLE_KEY or SUPABASE_ANON_KEY environment variable.",
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      /**
       * Supabase calls this to READ all cookies from the incoming request.
       * This is how it retrieves the current auth session (access/refresh tokens)
       * that Supabase stores in cookies.
       */
      getAll() {
        return cookie_store.getAll();
      },
      /**
       * Supabase calls this to WRITE cookies back to the response.
       * It typically happens when:
       * - a user signs in / signs out
       * - tokens are refreshed (access token rotation)
       * - the session changes
       *
       * `cookies_to_set` is an array of cookies (name/value/options)
       * that Supabase wants Next.js to store.
       */
      setAll(cookies_to_set: Parameters<SetAllCookies>[0]) {
        try {
          // For every cookie Supabase wants to set, write it into Next.js cookie store.
          cookies_to_set.forEach(({ name, value, options }) => {
            cookie_store.set(
              name,
              value,
              options as Parameters<typeof cookie_store.set>[2],
            );
          });
        } catch (error){
          if (process.env.NODE_ENV !== "production") {
              console.warn("[supabase] Could not set auth cookies in this context.", error);
            }       
           }
      },
    },
  });
}

export const createSupabaseServerClient = create_supabase_server_client;
