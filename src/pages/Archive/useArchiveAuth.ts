// Archive에서 로그인한 사용자 정보와 관리자 여부를 여러 컴포넌트가 공통으로 쓸 수 있게 함
// Props Drilling 문제를 Context API로 해결: createContext, useContext

// Props Drilling 예시. 인증정보를 쓰기 위해 아래와 같은 상황 발생 가능
// App
// ↓ props
// Archive
// ↓ props
// ArchiveList
// ↓ props
// PostCard

// ArchiveAuth = 인증 정보 타입 정의
// ArchiveAuthContext = 인증 정보 공유 공간
// useArchiveAuth() = 그 공간에서 인증 정보를 쉽게 꺼내오는 Custom Hook

import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

// 인터페이스! Archive 인증 Context 안에는 반드시 이런 값이 있어야 함
export interface ArchiveAuth {
  user: User | null // 현재 로그인한 사용자.
  isAdmin: boolean // 관리자인지 여부
  ready: boolean // 인증 확인중/확인완료
  error: string // 오류 메시지 저장
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// createContext: React Context(여러 컴포넌트가 공통으로 사용할 값을 보관해서 공유하는 공간)
export const ArchiveAuthContext = createContext<ArchiveAuth | null>(null) // ArchiveAuth 타입이거나 null(초기값)

export function useArchiveAuth() {
  const context = useContext(ArchiveAuthContext) // Context 안에 현재 저장되어 있는 값을 가져옴

  // Provider 밖 컴포넌트에서 사용했는지 확인
  if (!context) 
    throw new Error('Archive 인증 영역에서 사용해주세요.')

  // 정상적으로 Context 값이 있으면 그대로 반환
  return context
}
