// Archive 전체의 로그인 상태 관리
// Supabase Authentication으로 관리자 인증 처리
// 인증 정보를 Context로 공유하는 Layout

// ArchiveLayout: 실제 signIn/signOut 구현 (실제 인증 관리 담당)
//         ↓ Context에 넣음
// useArchiveAuth: Context 값을 꺼내주는 Hook
//         ↓
// ArchiveLogin: signIn을 꺼내서 로그인 버튼 눌렀을 때 실행 (로그인 창)

import { useCallback, useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase } from '../../lib/supabaseClient'
import { ArchiveAuthContext, useArchiveAuth } from './useArchiveAuth'
import ArchiveLogin from './ArchiveLogin'
import styles from './ArchiveCommon.module.css'

function ArchiveLayout() {

  // 현재 로그인 인증 상태 관리 (인증과 관련된 정보를 한 객체에 저장)
  const [auth, setAuth] = useState<{
    user: User | null;
    isAdmin: boolean;
    ready: boolean;
    error: string
  }>({
    user: null,
    isAdmin: false,
    ready: false,
    error: '' })

    // 관리자 로그인 모달이 열려 있는지
  const [loginOpen, setLoginOpen] = useState(false)

  // 현재 로그아웃 처리 중인지
  const [signingOut, setSigningOut] = useState(false)

  // 로그인/로그아웃 같은 행동 중 발생한 오류를 저장
  const [actionError, setActionError] = useState('')

  // 로그인 모달 닫는 함수
  // useCallback으로 감싸서 렌더링될 때마다 새로운 함수가 만들어지지 않게 함
  // useCallback: 함수를 기억해두는 React Hook + 의존성배열이 비어있으므로 처음 만든 함수를 계속 재사용
  const closeLogin = useCallback(() => setLoginOpen(false), [])

  // Supabase 로그인 상태가 바뀌는 걸 계속 확인 + auth state를 최신 상태로 유지
  useEffect(() => {
    // disposed: 이 컴포넌트가 이미 사라졌는지 표시
    // 이미 페이지가 사라졌는데 늦게 도착한 요청이 setAuth(...)를 실행하지 못하게 함
    let disposed = false

    // 여러 인증 확인 요청 중 어떤 요청이 가장 최신 요청인지 구분
    // 이전 요청의 결과가 더 늦게 도착했을 시 최신 요청이 아닌 이전 요청의 결과로 덮어씌워지지 않도록!
    let version = 0

    // 현재는 실제 구독 해제 함수가 없으니 빈 함수를 넣어둠
    let unsubscribe = () => {}

    // 컴포넌트가 사라질 때 남아 있는 timer를 전부 없애기 위해 사용
    const timers = new Set<ReturnType<typeof setTimeout>>()

    // Supabase 로그인 세션 확인 + 그 사용자가 Archive 관리자인지도 확인 → auth 갱신
    const verifySession = async (session: Session | null, request: number) => {
      // 초기값
      let next = {
         user: null as User | null, // 로그인 사용자 없음
         isAdmin: false, // 관리자 아님
         ready: true, // 인증 확인 완료
         error: '' // 오류 없음
      }

      try {
        // 현재 로그인된 Supabase 세션이 있다면 실제 사용자 정보 확인
        if (session) {
          const client = getSupabase() // Supabase client 가져오기

          // Supabase Authentication에 지금 실제 로그인 사용자가 누구인지 확인
          // 확인 성공 시 data.user에 현재 사용자가 들어감 (구조분해 사용)
          const { data, error } = await client.auth.getUser()
          if (error) throw error // Supabase에서 사용자 확인 실패 → 오류 처리

          // 두 번째 인증 단계, 현재 로그인된 사용자가 Archive 관리자 목록에 있는지 확인
          // 성공하면 현재 인증 상태를 만듦 (구조분해 + 다른 변수명 사용)
          const { data: isAdmin, error: roleError } = await client.rpc('is_archive_admin')
          if (roleError) throw roleError
          next = {
            ...next, // spread 문법! 아래 user, isAdmin만 덮어씀
            user: data.user, // 현재 로그인한 Supabase 사용자
            isAdmin: isAdmin === true // 현재 관리자 여부
          }

        }
      } catch {
        next.error = '관리자 인증을 확인하지 못했습니다. 다시 로그인해주세요.'
      }
      // !disposed: ArchiveLayout이 아직 화면에 존재
      // request === version: 지금 끝난 인증 확인 요청이 가장 최신 요청
      // → 컴포넌트가 아직 존재하고 + 가장 최신 인증 확인 요청일 때만 auth 갱신
      if (!disposed && request === version) setAuth(next)
    }

    try {
      // Supabase 인증 상태 변경 구독 등록
      // 로그인, 로그아웃, 세션 복구, 토큰 갱신 등이 발생할 때 전달받은 session으로 인증 상태 재확인
      // onAuthStateChange(...): Supabase Authentication에서 인증 상태가 바뀌면 안에 전달한 함수를 실행
      // _event: 어떤 인증 이벤트가 발생했는지 알려주는 값 (_를 붙여서 값은 받지만 현재 코드에서는 사용하지 않음을 표시)
      // session: 현재 인증 상태의 Supabase 세션 (로그아웃 상태면 null)
      const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
        // 인증 상태가 바뀔 때마다 version을 1 증가시키고
        // 이번 인증 확인 요청의 번호를 request에 저장
        const request = ++version

        // 인증 콜백 밖에서 Supabase 요청 실행 (Auth 잠금과 충돌 방지)
        const timer = setTimeout(() => {
          timers.delete(timer)
          if (disposed) return // 컴포넌트가 이미 사라졌으면 종료

          // 같은 계정의 토큰 갱신 중에는 작성 폼을 유지
          setAuth((current) => session?.user.id === current.user?.id && current.ready
            ? current
            : { user: null, isAdmin: false, ready: false, error: '' })
          void verifySession(session, request)
        }, 0)

        // 컴포넌트 종료 시 취소할 수 있도록 생성한 timer 저장
        timers.add(timer)
      })

      // Supabase가 반환한 구독 객체의 해제 함수를 공통 cleanup 함수에 연결
      unsubscribe = () => data.subscription.unsubscribe()
    } catch {
      // Supabase client 생성 또는 인증 구독 등록 실패 처리
      const timer = setTimeout(() => {
        if (!disposed) setAuth({ user: null, isAdmin: false, ready: true, error: 'Archive 연결 설정을 확인해주세요.' })
      }, 0)
      timers.add(timer)
    }

    // ArchiveLayout이 화면에서 사라질 때 실행되는 useEffect 정리 함수
    // 인증 구독 해제 + 예약된 timer 제거로 불필요한 후속 실행 방지
    return () => {
      disposed = true
      unsubscribe()
      timers.forEach(clearTimeout)
    }
  }, [])

  // 이메일과 비밀번호를 전달받아 Supabase 관리자 로그인 처리
  const signIn = async (email: string, password: string) => {
    // 환경변수 설정을 사용하는 Supabase client 준비
    const client = getSupabase()

    // 앞뒤 공백을 제거한 이메일과 비밀번호로 Supabase Authentication 로그인 요청
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })

    // 로그인 요청 실패 시 ArchiveLogin에서 표시할 오류 전달
    if (error) throw new Error('이메일 또는 비밀번호를 확인해주세요.')

    // 로그인된 사용자가 Archive 관리자 명단에 포함되는지 RPC 함수로 확인
    const { data: isAdmin, error: roleError } = await client.rpc('is_archive_admin')

    // 관리자 확인 실패 또는 일반 사용자 로그인 시 현재 기기의 세션 제거
    if (roleError || !isAdmin) {
      await client.auth.signOut({ scope: 'local' })
      throw new Error(roleError ? '관리자 권한을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.' : 'Archive 관리자 계정만 로그인할 수 있습니다.')
    }

    // 관리자 로그인 성공 후 이전 로그인/로그아웃 오류 제거
    setActionError('')
  }

  // 현재 기기에 저장된 Supabase 로그인 세션 해제
  const signOut = async () => {
    // 중복 클릭 방지와 버튼 문구 변경을 위한 로그아웃 진행 상태 설정
    setSigningOut(true)
    setActionError('')

    try {
      // scope: 'local': 다른 기기의 세션은 유지하고 현재 브라우저의 세션만 로그아웃
      const { error } = await getSupabase().auth.signOut({ scope: 'local' })
      if (error) throw error

      // 로그아웃 성공 상태를 화면에 즉시 반영
      setAuth({ user: null, isAdmin: false, ready: true, error: '' })
    } catch {
      // 로그아웃 실패 시 기존 인증 상태는 유지하고 화면용 오류만 저장
      setActionError('로그아웃하지 못했습니다. 다시 시도해주세요.')
    } finally {
      // 성공 여부와 관계없이 로그아웃 진행 상태 종료
      setSigningOut(false)
    }
  }

  return (
    // 하위 Archive 컴포넌트에서 인증 상태와 로그인/로그아웃 함수를 사용할 수 있도록 Context 제공
    <ArchiveAuthContext.Provider value={{ ...auth, signIn, signOut }}>
      <div className={styles.layout}>
        {/* Archive 페이지 공통 상단 관리자 인증 영역 */}
        <div className={`container ${styles.authBar}`}>
          <div className={styles.authActions}>
            {/* 인증 확인 중 / 로그인 상태 / 로그아웃 상태에 따른 화면 분기 */}
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
          {/* 인증 확인 또는 로그인/로그아웃 동작 중 발생한 오류 표시 */}
          {(auth.error || actionError) && <p role="alert" className={styles.error}>{actionError || auth.error}</p>}
        </div>

        {/* 현재 URL과 일치하는 Archive 하위 라우트 페이지 표시 */}
        <Outlet />
      </div>

      {/* 관리자 로그인 버튼으로 loginOpen이 true가 되었을 때만 로그인 모달 표시 */}
      {loginOpen && <ArchiveLogin onClose={closeLogin} />}
    </ArchiveAuthContext.Provider>
  )
}

// 관리자 권한이 필요한 하위 라우트 접근 제한 컴포넌트
export function RequireArchiveAdmin() {
  // 가장 가까운 ArchiveAuthContext에서 인증 확인 상태와 관리자 여부 가져오기
  const { ready, isAdmin } = useArchiveAuth()

  // 인증 확인 전이거나 관리자가 아니면 요청한 페이지 대신 안내 화면 표시
  if (!ready || !isAdmin) return (
    <section><div className="container">
      <h1 className={styles.stateTitle}>{ready ? '관리자 로그인이 필요합니다.' : '인증을 확인하고 있습니다.'}</h1>
      {ready && <p className={styles.message}>상단의 관리자 로그인 버튼으로 로그인해주세요.</p>}
      <Link to="/archive" className={styles.button}>목록으로 돌아가기</Link>
    </div></section>
  )

  // 관리자 인증 완료 시 현재 URL과 일치하는 보호된 하위 라우트 페이지 표시
  return <Outlet />
}

export default ArchiveLayout
