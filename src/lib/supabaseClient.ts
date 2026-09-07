import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

let client: SupabaseClient<Database> | null = null

// Archive에서 요청할 때 초기화하여 Home은 연결 설정에 의존하지 않음
export function getSupabase() {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key || !key.startsWith('sb_publishable_')) {
    throw new Error('Archive 연결 설정을 확인해주세요.')
  }

  client = createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })

  return client
}
