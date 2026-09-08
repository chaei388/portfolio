import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// lazy singleton 방식! 함수를 호출할 때 클라이언트 객체 처음 생성
// lazy: 필요할 때 처음 생성
// singleton: 처음 한 번 생성 후 같은 객체 계속 사용

// 강의에서는 서비스 import시 바로 생성했었으나
// Home에는 supabase 설정이 불필요하므로 Home과 Supabase 설정을 분리
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
      persistSession: true, // 새로고침해도 로그인 유지
      autoRefreshToken: true, // 로그인 토큰 만료 전에 자동 갱신
      detectSessionInUrl: false, // 이메일 인증 링크를 사용X, URL에서 세션 찾지 않음
    },
  })

  return client
}
