import { useEffect, useRef, useState, type FormEvent } from 'react'
import Modal from '../../components/common/Modal/Modal'
import { useArchiveAuth } from './useArchiveAuth'
import styles from './ArchiveCommon.module.css'

export default function ArchiveLogin({ onClose }: { onClose: () => void }) {
  const { signIn } = useArchiveAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const busyRef = useRef(false)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    formRef.current?.querySelector('input')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busyRef.current) onClose()
      if (event.key !== 'Tab') return
      const controls = formRef.current?.closest('[role="dialog"]')?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')
      if (!controls?.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus() }
  }, [onClose])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '로그인하지 못했습니다. 다시 시도해주세요.')
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  return (
    <Modal title="관리자 로그인" size="small" onClose={() => { if (!busyRef.current) onClose() }}>
      <form ref={formRef} className={styles.loginForm} onSubmit={(event) => void submit(event)}>
        <label htmlFor="archive-email">이메일</label>
        <input id="archive-email" className={styles.input} type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} />
        <label htmlFor="archive-password">비밀번호</label>
        <input id="archive-password" className={styles.input} type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} />
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? '로그인 중…' : '로그인'}</button>
      </form>
    </Modal>
  )
}
