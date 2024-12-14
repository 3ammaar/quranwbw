import { createClient } from '@supabase/supabase-js'
import { supabaseProjectUrl, supabaseAnonymousKey } from '$data/websitesettings'

export const supabase = createClient(
  supabaseProjectUrl,
  supabaseAnonymousKey,
  {
    auth: 
    {
      localStorage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);