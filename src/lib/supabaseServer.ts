import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Server-side Supabase client — uses service role key for elevated access
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser
// NEVER fall back to anon key — that would silently bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('[Supabase Server] CRITICAL: NEXT_PUBLIC_SUPABASE_URL is not set.');
}
if (!supabaseServiceKey) {
  console.error('[Supabase Server] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set. Server-side operations will fail securely.');
}

// Server-side Supabase client (for API routes and server components)
// Uses a build-time placeholder key if the real key is missing — actual requests will fail safely
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey || 'build-time-placeholder-key-not-for-production',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);
