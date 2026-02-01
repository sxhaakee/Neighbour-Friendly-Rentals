import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Hardcoded for API routes (env variables don't work reliably in API routes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epolbovqrclrfozfgwvc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwb2xib3ZxcmNscmZvemZnd3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODA0MzgsImV4cCI6MjA3NTY1NjQzOH0.aBdV7FRH6DI6JF-quLD2vTP9n087Zkri4KoSJ2VRFD4';

if (!supabaseAnonKey) {
  console.warn('[Supabase Server] Missing anon key - feed API will fail');
}

// Server-side Supabase client (for API routes and server components)
// No session persistence or browser-specific features
export const supabaseServer = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});
