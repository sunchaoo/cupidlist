import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key.
 *
 * This must NEVER be imported into client components — the service role key
 * bypasses Row Level Security. All access goes through our API routes, which
 * authenticate the user (via NextAuth) and scope every query to their id.
 */
let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return client;
}

/** Table that holds one row per user: their friends + matches as JSON. */
export const USER_DATA_TABLE = "user_data";
