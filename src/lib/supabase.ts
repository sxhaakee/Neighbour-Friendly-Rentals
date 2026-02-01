import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epolbovqrclrfozfgwvc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwb2xib3ZxcmNscmZvemZnd3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODA0MzgsImV4cCI6MjA3NTY1NjQzOH0.aBdV7FRH6DI6JF-quLD2vTP9n087Zkri4KoSJ2VRFD4';

if (!supabaseUrl || !supabaseAnonKey) {
  // Check if we are in a build environment where these might not be set yet, or warn
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
