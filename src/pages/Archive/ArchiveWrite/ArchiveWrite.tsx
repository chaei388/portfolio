import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal'
import Dropdown from '../../../components/common/Dropdown/Dropdown'
import { codeLanguageOptions } from '../../../data/archiveLanguages'
import type { CodeLanguage } from '../../../types/archive'
import styles from './ArchiveWrite.module.css'
import common from '../ArchiveCommon.module.css'
import { archiveError, getPost, savePost, type SavedPost } from '../../../lib/archiveApi'
import { useArchiveQuery } from '../../../hooks/useArchiveQuery'
import { useArchiveAuth } from '../useArchiveAuth'

function ArchiveWrite() {
  const { id } = useParams()
  const { user } = useArchiveAuth()
  return id ? <ArchiveEdit key={`${id}:${user?.id}`} id={id} /> : <ArchivePostForm key={user?.id} />
}

function ArchiveEdit({ id }: { id: string }) {
  const { user, isAdmin } = useArchiveAuth()
  const load = useCallback((signal: AbortSignal) => getPost(id, signal), [id])
  const { data, loading, error, refresh } = useArchiveQuery(load, `${user?.id}:${isAdmin}`)
  if (loading || error || !data || data.post.ownerId !== user?.id) return (
    <section><div className="container">
      <p className={common.message} role={error ? 'alert' : 'status'}>{loading ? '게시글을 불러오는 중…' : error || '수정할 게시글을 찾을 수 없습니다.'}</p>
      {error && <button type="button" className={common.button} onClick={refresh}>다시 시도</button>}
      <Link className={common.button} to="/archive">목록으로 돌아가기</Link>
    </div></section>
  )
  return <ArchivePostForm initial={data.post} />
}

function ArchivePostForm({ initial }: { initial?: SavedPost }) {
  const navigate = useNavigate()
  const { isAdmin, ready } = useArchiveAuth()
  const initialTags = initial?.tags?.map((tag) => `#${tag}`).join(' ') ?? ''
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [language, setLanguage] = useState<CodeLanguage | ''>(initial?.language ?? '')
  const [codeText, setCodeText] = useState(initial?.codeText ?? '')
  const [tagText, setTagText] = useState(initialTags)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [error, setError] = useState('')
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const hasDraft = title !== (initial?.title ?? '') || content !== (initial?.content ?? '')
    || language !== (initial?.language ?? '') || codeText !== (initial?.codeText ?? '') || tagText !== initialTags
  const returnPath = initial ? `/archive/${initial.id}` : '/archive'

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
      const id = await savePost(newPost, initial?.id)
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
      navigate(returnPath)
      return
    }

    // 작성한 내용이 있으면 이동 전에 한 번 더 확인
    setIsCancelModalOpen(true)
  }

  return (
    <>
      <section className={styles.write}>
        <div className="container">
          <h1 className={styles.title}>{initial ? 'Archive Edit' : 'Archive Write'}</h1>

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
          onConfirm={() => navigate(returnPath)}
        />
      )}
    </>
  )
}

export default ArchiveWrite
