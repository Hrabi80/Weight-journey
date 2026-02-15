import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SetAllCookies } from "@supabase/ssr";
import { env } from "@/src/env";

function mask_cookie_value(value: string): string {
  if (value.length <= 10) {
    return "***";
  }
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export async function create_supabase_server_client(): Promise<SupabaseClient> {
  const cookie_store = await cookies();

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL environment variable.");
  }

  if (!supabaseKey) {
    throw new Error("Missing SUPABASE_PUBLISHABLE_KEY environment variable.");
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        const all = cookie_store.getAll();

        if (process.env.NODE_ENV !== "production") {
          const names = all.map((c) => c.name);
          const sb_names = names.filter((n) => n.startsWith("sb-"));

          console.log("[supabase][getAll] cookie names:", names);
          console.log("[supabase][getAll] sb-* cookies:", sb_names);

          // Optional: print masked values for sb cookies only
          const masked = all
            .filter((c) => c.name.startsWith("sb-"))
            .map((c) => ({ name: c.name, value: mask_cookie_value(c.value) }));

          console.log("[supabase][getAll] sb values (masked):", masked);
        }

        return all;
      },

      setAll(cookies_to_set: Parameters<SetAllCookies>[0]) {
        try {
          if (env.NODE_ENV !== "production") {
            const names = cookies_to_set.map((c) => c.name);
            console.log("[supabase][setAll] setting cookies:", names);
          }

          cookies_to_set.forEach(({ name, value, options }) => {
            cookie_store.set(
              name,
              value,
              options as Parameters<typeof cookie_store.set>[2]
            );
          });
        } catch (error) {
          if (env.NODE_ENV !== "production") {
            console.warn(
              "[supabase][setAll] Could not set auth cookies (read-only context).",
              error
            );
          }
        }
      },
    },
  });
}

export const createSupabaseServerClient = create_supabase_server_client;
