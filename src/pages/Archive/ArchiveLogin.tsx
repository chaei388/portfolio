import { useEffect, useRef, useState, type FormEvent } from 'react'
import Modal from '../../components/common/Modal/Modal'
import { useArchiveAuth } from './useArchiveAuth'
import styles from './ArchiveCommon.module.css'

// onClose: 로그인 모달을 닫을 때 부모 컴포넌트에서 실행할 함수
export default function ArchiveLogin({ onClose }: { onClose: () => void }) {
  // ArchiveAuthContext에서 ArchiveLayout이 구현한 관리자 로그인 함수 가져오기
  const { signIn } = useArchiveAuth()

  // 사용자가 입력한 이메일과 비밀번호를 각각 저장하는 상태
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 로그인 요청 진행 여부와 화면에 표시할 로그인 오류 저장
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // 로그인 form DOM 요소 참조
  // 모달이 열렸을 때 첫 input에 포커스를 주고, 모달 안의 조작 요소를 찾을 때 사용
  const formRef = useRef<HTMLFormElement>(null)

  // 로그인 요청 진행 여부를 렌더링과 관계없이 즉시 확인하는 값
  // state 반영 전에 submit이 연속 실행되는 상황을 막기 위해 busy 상태와 함께 사용
  const busyRef = useRef(false)

  // 로그인 모달이 열렸을 때 키보드 포커스 설정
  useEffect(() => {
    // 모달이 열리기 직전에 포커스되어 있던 요소 저장
    // 모달이 닫히면 원래 사용하던 버튼으로 포커스를 되돌릴 때 사용
    const previous = document.activeElement as HTMLElement | null

    // form 안에서 처음 발견되는 input인 이메일 입력창에 포커스
    formRef.current?.querySelector('input')?.focus()

    // Escape 닫기와 Tab 포커스 순환을 처리하는 키보드 이벤트 함수
    const onKeyDown = (event: KeyboardEvent) => {
      // 로그인 요청 중이 아닐 때 Escape를 누르면 모달 닫기
      if (event.key === 'Escape' && !busyRef.current) onClose()

      // Tab과 관계없는 키라면 아래 포커스 이동 로직을 실행하지 않고 종료
      if (event.key !== 'Tab') return

      // 현재 form에서 가장 가까운 dialog 영역 안의 사용 가능한 버튼과 input 찾기
      // :not(:disabled)는 로그인 요청 중 비활성화된 요소를 포커스 대상에서 제외
      const controls = formRef.current
        ?.closest('[role="dialog"]')
        ?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled)',
        )

      // 포커스를 이동할 요소가 없으면 종료
      if (!controls?.length) return

      // dialog 안에서 포커스 가능한 첫 번째 요소와 마지막 요소
      const first = controls[0]
      const last = controls[controls.length - 1]

      // 첫 요소에서 Shift + Tab을 누르면 dialog 밖으로 나가지 않고 마지막 요소로 이동
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }

      // 마지막 요소에서 Tab을 누르면 dialog 밖으로 나가지 않고 첫 요소로 이동
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    // document 전체에서 키보드 입력을 확인하도록 이벤트 등록
    document.addEventListener('keydown', onKeyDown)

    // 모달이 닫힐 때 키보드 이벤트 제거 + 모달이 열리기 전 요소로 포커스 복구
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [onClose])

  // 로그인 form 제출 처리
  const submit = async (event: FormEvent) => {
    // form 제출 시 브라우저가 페이지를 새로고침하는 기본 동작 방지
    event.preventDefault()

    // 이미 로그인 요청이 진행 중이면 중복 제출 방지
    if (busyRef.current) return

    // 비동기 요청 시작 즉시 잠금값과 화면 상태를 모두 변경
    busyRef.current = true
    setBusy(true)
    setError('')

    try {
      // ArchiveLayout의 signIn 함수에 현재 입력값 전달
      await signIn(email, password)

      // 관리자 로그인 성공 후 로그인 모달 닫기
      onClose()
    } catch (cause) {
      // signIn에서 전달한 오류가 있으면 해당 문구 사용
      // Error 객체가 아닌 예상하지 못한 값이면 기본 오류 문구 사용
      setError(cause instanceof Error ? cause.message : '로그인하지 못했습니다. 다시 시도해주세요.')
    } finally {
      // 로그인 성공과 실패 여부에 관계없이 요청 진행 상태 해제
      busyRef.current = false
      setBusy(false)
    }
  }

  return (
    <Modal
      title="관리자 로그인"
      size="small"
      // 로그인 요청 중에는 X 버튼이나 바깥 영역 클릭으로 모달이 닫히지 않도록 제한
      onClose={() => {
        if (!busyRef.current) onClose()
      }}
    >
      <form
        ref={formRef}
        className={styles.loginForm}
        // submit이 반환하는 Promise를 이벤트 핸들러의 반환값으로 사용하지 않음을 void로 표시
        onSubmit={(event) => void submit(event)}
      >
        <label htmlFor="archive-email">이메일</label>
        <input
          id="archive-email"
          className={styles.input}
          type="email"
          autoComplete="username"
          required
          // value와 onChange를 연결한 React 제어 입력 요소
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          // 로그인 요청 중 입력값 변경 방지
          disabled={busy}
        />

        <label htmlFor="archive-password">비밀번호</label>
        <input
          id="archive-password"
          className={styles.input}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
        />

        {/* 로그인 실패 시에만 스크린 리더에도 전달되는 오류 문구 표시 */}
        {error && <p role="alert" className={styles.error}>{error}</p>}

        {/* 로그인 요청 중 버튼 비활성화 및 진행 상태 문구 표시 */}
        <button
          className={styles.primaryButton}
          type="submit"
          disabled={busy}
        >
          {busy ? '로그인 중…' : '로그인'}
        </button>
      </form>
    </Modal>
  )
}
