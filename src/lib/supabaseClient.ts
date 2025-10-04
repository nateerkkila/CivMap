import { createClient } from '@supabase/supabase-js';

// Get the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log(supabaseUrl)

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);