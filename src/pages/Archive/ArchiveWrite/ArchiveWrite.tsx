import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal'
import Dropdown from '../../../components/common/Dropdown/Dropdown'
import { codeLanguageOptions } from '../../../data/archiveLanguages'
import type { CodeLanguage } from '../../../types/archive'
import styles from './ArchiveWrite.module.css'
import common from '../ArchiveCommon.module.css'
import { archiveError, createPost } from '../../../lib/archiveApi'
import { useArchiveAuth } from '../useArchiveAuth'

function ArchiveWrite() {
  const { user } = useArchiveAuth()
  return <ArchivePostForm key={user?.id} />
}

function ArchivePostForm() {
  const navigate = useNavigate()
  const { isAdmin, ready } = useArchiveAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState<CodeLanguage | ''>('')
  const [codeText, setCodeText] = useState('')
  const [tagText, setTagText] = useState('')
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [error, setError] = useState('')
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const hasDraft = Boolean(title.trim() || content.trim() || language || codeText.trim() || tagText.trim())

  useEffect(() => {
    if (!hasDraft) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [hasDraft])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busyRef.current || !ready || !isAdmin) return
    setError('')
    if (!title.trim() || !content.trim()) { setError('제목과 본문을 입력해주세요.'); return }

    const trimmedCodeText = codeText.trim()
    const tags = [...new Set(tagText
      .split('#')
      .map((tag) => tag.trim())
      .filter(Boolean))]
    if (tags.length > 20) { setError('해시태그는 최대 20개까지 입력해주세요.'); return }

    const newPost = {
      title,
      content,
      language: trimmedCodeText ? language || null : null,
      codeText: trimmedCodeText || null,
      tags: tags.length > 0 ? tags : null,
    }

    busyRef.current = true
    setBusy(true)
    try {
      const id = await createPost(newPost)
      navigate(`/archive/${id}`, { replace: true })
    } catch (cause) {
      setError(archiveError(cause))
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const handleCancelClick = () => {
    if (busyRef.current) return
    // 작성한 내용이 없으면 확인 없이 바로 목록으로 이동
    if (!hasDraft) {
      navigate('/archive')
      return
    }

    // 작성한 내용이 있으면 이동 전에 한 번 더 확인
    setIsCancelModalOpen(true)
  }

  return (
    <>
      <section className={styles.write}>
        <div className="container">
          <h1 className={styles.title}>Archive Write</h1>

          <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} aria-busy={busy}>
            <div className={styles.field}>
              <label htmlFor="archive-title" className={styles.label}>
                제목
                <span className={styles.requiredMark} aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="archive-title"
                type="text"
                className={styles.input}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="제목을 입력해주세요."
                required
                maxLength={200}
                disabled={busy}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="archive-content" className={styles.label}>
                본문
                <span className={styles.requiredMark} aria-hidden="true">
                  *
                </span>
              </label>
              <textarea
                id="archive-content"
                className={styles.textarea}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="해결 과정이나 기록할 내용을 작성해주세요."
                required
                maxLength={50000}
                disabled={busy}
              />
            </div>

            <div className={styles.field}>
              <div className={styles.codeLabelRow}>
                <label htmlFor="archive-code" className={styles.label}>
                  코드
                </label>
                <Dropdown
                  className={styles.languageDropdown}
                  value={language}
                  options={codeLanguageOptions}
                  placeholder="언어 선택"
                  onChange={(nextLanguage) =>
                    setLanguage(nextLanguage as CodeLanguage | '')
                  }
                />
              </div>

              <textarea
                id="archive-code"
                className={`${styles.textarea} ${styles.codeTextarea}`}
                value={codeText}
                onChange={(event) => setCodeText(event.target.value)}
                placeholder="코드를 입력해주세요."
                maxLength={50000}
                disabled={busy}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="archive-tags" className={styles.label}>
                해시태그
              </label>
              <input
                id="archive-tags"
                type="text"
                className={styles.input}
                value={tagText}
                onChange={(event) => setTagText(event.target.value)}
                placeholder="#React #Navigation 처럼 해시태그를 작성해주세요."
                maxLength={2000}
                disabled={busy}
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancelClick}
                disabled={busy}
              >
                취소
              </button>
              <button type="submit" className={styles.saveButton} disabled={busy}>
                {busy ? '저장 중…' : '저장'}
              </button>
            </div>

            {error && <p className={common.error} role="alert">{error}</p>}
          </form>
        </div>
      </section>

      {isCancelModalOpen && (
        <ConfirmModal
          title="작성을 취소하시겠습니까?"
          description="작성 중인 내용은 저장되지 않고 사라집니다."
          confirmLabel="나가기"
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={() => navigate('/archive')}
        />
      )}
    </>
  )
}

export default ArchiveWrite
