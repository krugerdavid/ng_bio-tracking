import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create a singleton instance that persists across HMR updates
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

// Handle HMR (Hot Module Replacement)
if (import.meta.hot) {
  // Preserve the instance across HMR updates
  if (import.meta.hot.data.supabase) {
    supabaseInstance = import.meta.hot.data.supabase;
  }

  // Store the instance before disposal
  import.meta.hot.dispose(data => {
    data.supabase = supabaseInstance;
  });
}

export const supabase = getSupabaseClient();
