import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Returns the authenticated user, or null when there is no session OR Supabase
 * is not configured yet (demo mode). Callers fall back to mock data on null.
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
