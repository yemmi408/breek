import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, isDevelopment } from './env';

// Debug environment variables in development
if (isDevelopment()) {
  console.log('Supabase URL:', getSupabaseUrl());
  console.log('Supabase Anon Key:', getSupabaseAnonKey().slice(0, 10) + '...');
}

export const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey(),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Debug Supabase client initialization
if (isDevelopment()) {
  console.log('Supabase client initialized:', !!supabase);
} 