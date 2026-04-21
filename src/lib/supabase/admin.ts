import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Admin client without strict generic typing (used only in server-side cron/API routes)
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
