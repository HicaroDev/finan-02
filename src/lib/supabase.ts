
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

const supabaseUrl = 'https://vgpklawlsjcesklmezme.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZncGtsYXdsc2pjZXNrbG1lem1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODA2NzIsImV4cCI6MjA2NDY1NjY3Mn0.Fm6BkDe-3vum90l__eSrxbw55ozboztWkc6-S2N1CE4'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
