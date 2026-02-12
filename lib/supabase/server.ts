import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase environment variables are not set. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      async get(name: string) {
        const cookieStore = await cookies();
        return cookieStore.get(name)?.value;
      },
      async set(name, value, options) {
        try {
          const cookieStore = await cookies();
          cookieStore.set({ name, value, ...options });
        } catch {
          // Cookies can only be set in Server Actions or Route Handlers.
          // Ignore when Supabase tries to refresh the session during Server Component render.
        }
      },
      async remove(name, options) {
        try {
          const cookieStore = await cookies();
          cookieStore.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        } catch {
          // Same as set: ignore when we're in a Server Component.
        }
      },
    },
  });
}

