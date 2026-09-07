import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

export interface ArchiveAuth {
  user: User | null
  isAdmin: boolean
  ready: boolean
  error: string
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const ArchiveAuthContext = createContext<ArchiveAuth | null>(null)

export function useArchiveAuth() {
  const context = useContext(ArchiveAuthContext)
  if (!context) throw new Error('Archive 인증 영역에서 사용해주세요.')
  return context
}
