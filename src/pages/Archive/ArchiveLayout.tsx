import { useCallback, useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase } from '../../lib/supabaseClient'
import { ArchiveAuthContext, useArchiveAuth } from './useArchiveAuth'
import ArchiveLogin from './ArchiveLogin'
import styles from './ArchiveCommon.module.css'

function ArchiveLayout() {
  const [auth, setAuth] = useState<{
    user: User | null; isAdmin: boolean; ready: boolean; error: string
  }>({ user: null, isAdmin: false, ready: false, error: '' })
  const [loginOpen, setLoginOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [actionError, setActionError] = useState('')
  const closeLogin = useCallback(() => setLoginOpen(false), [])

  useEffect(() => {
    let disposed = false
    let version = 0
    let unsubscribe = () => {}
    const timers = new Set<ReturnType<typeof setTimeout>>()

    const verifySession = async (session: Session | null, request: number) => {
      let next = { user: null as User | null, isAdmin: false, ready: true, error: '' }
      try {
        if (session) {
          const client = getSupabase()
          const { data, error } = await client.auth.getUser()
          if (error) throw error
          const { data: isAdmin, error: roleError } = await client.rpc('is_archive_admin')
          if (roleError) throw roleError
          next = { ...next, user: data.user, isAdmin: isAdmin === true }
        }
      } catch {
        next.error = '관리자 인증을 확인하지 못했습니다. 다시 로그인해주세요.'
      }
      if (!disposed && request === version) setAuth(next)
    }

    try {
      const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
        const request = ++version
        // 인증 콜백 밖에서 Supabase 요청 실행 (Auth 잠금과 충돌 방지)
        const timer = setTimeout(() => {
          timers.delete(timer)
          if (disposed) return
          // 같은 계정의 토큰 갱신 중에는 작성 폼을 유지
          setAuth((current) => session?.user.id === current.user?.id && current.ready
            ? current
            : { user: null, isAdmin: false, ready: false, error: '' })
          void verifySession(session, request)
        }, 0)
        timers.add(timer)
      })
      unsubscribe = () => data.subscription.unsubscribe()
    } catch {
      const timer = setTimeout(() => {
        if (!disposed) setAuth({ user: null, isAdmin: false, ready: true, error: 'Archive 연결 설정을 확인해주세요.' })
      }, 0)
      timers.add(timer)
    }
    return () => {
      disposed = true
      unsubscribe()
      timers.forEach(clearTimeout)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const client = getSupabase()
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new Error('이메일 또는 비밀번호를 확인해주세요.')
    const { data: isAdmin, error: roleError } = await client.rpc('is_archive_admin')
    if (roleError || !isAdmin) {
      await client.auth.signOut({ scope: 'local' })
      throw new Error(roleError ? '관리자 권한을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.' : 'Archive 관리자 계정만 로그인할 수 있습니다.')
    }
    setActionError('')
  }

  const signOut = async () => {
    setSigningOut(true)
    setActionError('')
    try {
      const { error } = await getSupabase().auth.signOut({ scope: 'local' })
      if (error) throw error
      setAuth({ user: null, isAdmin: false, ready: true, error: '' })
    } catch {
      setActionError('로그아웃하지 못했습니다. 다시 시도해주세요.')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <ArchiveAuthContext.Provider value={{ ...auth, signIn, signOut }}>
      <div className={styles.layout}>
        <div className={`container ${styles.authBar}`}>
          <div className={styles.authActions}>
            {!auth.ready ? <span className={styles.hint}>인증 확인 중…</span> : auth.user ? (
              <>
                <span className={styles.hint}>{auth.isAdmin ? '관리자' : '관리 권한 없음'}</span>
                <button type="button" className={styles.button} disabled={signingOut} onClick={() => void signOut()}>
                  {signingOut ? '로그아웃 중…' : '로그아웃'}
                </button>
              </>
            ) : (
              <button type="button" className={styles.button} onClick={() => setLoginOpen(true)}>관리자 로그인</button>
            )}
          </div>
          {(auth.error || actionError) && <p role="alert" className={styles.error}>{actionError || auth.error}</p>}
        </div>
        <Outlet />
      </div>
      {loginOpen && <ArchiveLogin onClose={closeLogin} />}
    </ArchiveAuthContext.Provider>
  )
}

export function RequireArchiveAdmin() {
  const { ready, isAdmin } = useArchiveAuth()
  if (!ready || !isAdmin) return (
    <section><div className="container">
      <h1 className={styles.stateTitle}>{ready ? '관리자 로그인이 필요합니다.' : '인증을 확인하고 있습니다.'}</h1>
      {ready && <p className={styles.message}>상단의 관리자 로그인 버튼으로 로그인해주세요.</p>}
      <Link to="/archive" className={styles.button}>목록으로 돌아가기</Link>
    </div></section>
  )
  return <Outlet />
}

export default ArchiveLayout
