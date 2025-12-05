import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ Supabase Keys missing! Check your .env.local file.");
  // Return a dummy client so the app doesn't crash immediately
  throw new Error("Supabase Keys Missing");
}

export const supabase = createClient(supabaseUrl, supabaseKey)
