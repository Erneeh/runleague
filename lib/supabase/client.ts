import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

let browserClient:
  | ReturnType<typeof createBrowserClient<Database>>
  | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        "Supabase environment variables are not set. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }

    browserClient = createBrowserClient<Database>(url, anonKey);
  }

  return browserClient;
}

