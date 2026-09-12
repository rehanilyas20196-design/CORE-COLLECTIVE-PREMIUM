import { createClient } from '@supabase/supabase-js'

let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') return null;
    throw new Error('Supabase URL and Anon Key must be set in environment variables');
  }
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export const supabase = getSupabase();
