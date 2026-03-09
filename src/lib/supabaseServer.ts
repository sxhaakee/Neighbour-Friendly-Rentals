import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Server-side Supabase client — uses service role key for elevated access
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Supabase Server] CRITICAL: Missing environment variables. Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

// Server-side Supabase client (for API routes and server components)
// No session persistence or browser-specific features
export const supabaseServer = createClient<Database>(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);
