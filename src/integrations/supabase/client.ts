// This file was originally generated but is now maintained manually.
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabaseClient: SupabaseClient<Database> | undefined;

// Import the supabase client like this:
// import { getSupabaseClient } from "@/integrations/supabase/client";
//
//
// Then call:
// const supabase = getSupabaseClient();

export function getSupabaseClient() {
  if (!supabaseClient) {
    if (!SUPABASE_URL) {
      throw new Error('VITE_SUPABASE_URL is not set in the environment variables.');
    }

    if (!SUPABASE_PUBLISHABLE_KEY) {
      throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY is not set in the environment variables.');
    }

    let storage: Storage | undefined;
    let persistSession = true;

    if (typeof window !== 'undefined') {
      try {
        storage = window.localStorage;
        const testKey = '__supabase_auth_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
      } catch {
        storage = undefined;
        persistSession = false;
      }
    } else {
      storage = undefined;
      persistSession = false;
    }

    supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage,
        persistSession,
        autoRefreshToken: true,
      }
    });
  }

  return supabaseClient;
}