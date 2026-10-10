import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missing = [
  !url && 'VITE_SUPABASE_URL',
  !key && 'VITE_SUPABASE_ANON_KEY',
].filter(Boolean);

if (missing.length > 0) {
  console.warn(
    `Supabase client not created. Missing ${missing.join(', ')}.`
  );
}

export const supabase = missing.length > 0 ? null : createClient(url, key);
export const supabaseReady = supabase !== null;
