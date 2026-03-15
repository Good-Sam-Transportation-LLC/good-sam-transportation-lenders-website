// This file was originally generated but is now maintained manually.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { getSupabaseClient } from "@/integrations/supabase/client";
//
// Then call:
// const supabase = getSupabaseClient();

export function getSupabaseClient() {
  if (!SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL is not set in the environment variables.');
  }

  if (!SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY is not set in the environment variables.');
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}