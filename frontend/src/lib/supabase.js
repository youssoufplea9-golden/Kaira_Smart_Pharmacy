import { createClient } from '@supabase/supabase-js'

// Fallback to placeholder values when .env is missing so the app doesn't crash.
// All Supabase queries will fail silently and hooks fall back to localStorage.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

