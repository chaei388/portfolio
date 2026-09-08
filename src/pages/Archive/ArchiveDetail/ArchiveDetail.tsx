import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal'
import Dropdown from '../../../components/common/Dropdown/Dropdown'
import { codeLanguageOptions } from '../../../data/archiveLanguages'
import { archiveError, deleteAnswer, deletePost, getPost, saveAnswer as insertAnswer, setPostStatus } from '../../../lib/archiveApi'
import type { AnswerInput } from '../../../lib/archiveApi'
import { useArchiveQuery } from '../../../hooks/useArchiveQuery'
import { useArchiveAuth } from '../useArchiveAuth'
import common from '../ArchiveCommon.module.css'
import type {
  CodeLanguage,
  PostStatus,
} from '../../../types/archive'
import solvedIcon from '../../../assets/icons/check_solved.svg'
import unsolvedIcon from '../../../assets/icons/check_unsolved.svg'
import styles from './ArchiveDetail.module.css'

type ConfirmModalType = 'status' | 'answer' | 'deletePost' | 'deleteAnswer' | null

const getNextStatus = (status: PostStatus): PostStatus =>
  status === 'solved' ? 'unsolved' : 'solved'

const getStatusLabel = (status: PostStatus) =>
  status === 'solved' ? '해결완료' : '미해결'

const getCodeLanguageLabel = (language: CodeLanguage | null) =>
  language
    ? codeLanguageOptions.find((option) => option.value === language)?.label ??
      language
    : 'Plain Text'

interface CodeBlockProps {
  language: CodeLanguage | null
  codeText: string
}

function CodeBlock({ language, codeText }: CodeBlockProps) {
  return (
    <figure className={styles.codeBlock}>
      <figcaption className={styles.codeHeader}>
        {getCodeLanguageLabel(language)}
      </figcaption>
      <pre className={styles.codeBody}>
        <code>{codeText}</code>
      </pre>
    </figure>
  )
}

function ArchiveDetail() {
  const { id } = useParams()
  const { user } = useArchiveAuth()
  return <ArchiveDetailContent key={`${id}:${user?.id ?? 'visitor'}`} id={id ?? ''} />
}

function ArchiveDetailContent({ id }: { id: string }) {
  const navigate = useNavigate()
  const { user, isAdmin, ready } = useArchiveAuth()
  const load = useCallback((signal: AbortSignal) => getPost(id, signal), [id])
  const { data, loading, error, refresh } = useArchiveQuery(load, `${ready}:${user?.id}:${isAdmin}`)
  const post = data?.post
  const [confirmModalType, setConfirmModalType] =
    useState<ConfirmModalType>(null)
  const [answerInput, setAnswerInput] = useState('')
  const [answerLanguage, setAnswerLanguage] = useState<CodeLanguage | ''>('')
  const [answerCode, setAnswerCode] = useState('')
  const [pendingAnswer, setPendingAnswer] = useState<AnswerInput | null>(null)
  const [targetAnswerId, setTargetAnswerId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [actionError, setActionError] = useState('')

  if (loading || error) return (
    <section className={styles.detail}><div className="container">
      {loading ? <p role="status" className={common.message}>게시글을 불러오는 중…</p> : <div role="alert"><p className={common.error}>{error}</p><button className={common.button} onClick={refresh}>다시 시도</button></div>}
      <Link to="/archive" className={styles.backLink}>목록으로 돌아가기</Link>
    </div></section>
  )

  if (!post) {
    return (
      <section className={styles.detail}>
        <div className="container">
          <div className={styles.notFound}>
            <h1 className={styles.notFoundTitle}>
              게시글을 찾을 수 없습니다.
            </h1>
            <Link to="/archive" className={styles.backLink}>
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const canManage = ready && isAdmin && user?.id === post.ownerId
  const currentStatus = post.status
  const nextStatus = getNextStatus(currentStatus)
  const isSolved = currentStatus === 'solved'
  const statusLabel = getStatusLabel(currentStatus)
  const statusIcon = isSolved ? solvedIcon : unsolvedIcon
  const postAnswers = data?.answers ?? []

  const runMutation = async (operation: () => Promise<unknown>, onSuccess?: () => void) => {
    if (!canManage || busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setActionError('')
    try {
      await operation()
      setConfirmModalType(null)
      onSuccess?.()
      refresh()
    } catch (cause) {
      setActionError(archiveError(cause))
      setConfirmModalType(null)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  const saveAnswer = (shouldMarkSolved: boolean) => {
    if (!pendingAnswer) return
    void runMutation(() => insertAnswer(post.id, pendingAnswer, shouldMarkSolved), () => {
      setAnswerInput('')
      setAnswerLanguage('')
      setAnswerCode('')
      setPendingAnswer(null)
    })
  }

  const closeAnswerConfirmModal = () => {
    if (busyRef.current) return
    setPendingAnswer(null)
    setConfirmModalType(null)
  }

  const handleAnswerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedAnswer = answerInput.trim()

    if (!trimmedAnswer || !canManage || busyRef.current) {
      return
    }

    // 저장 전 해결완료 처리 여부를 사용자가 직접 선택
    setPendingAnswer({
      content: trimmedAnswer,
      language: answerCode.trim() ? answerLanguage || null : null,
      codeText: answerCode.trim() || null,
    })
    setConfirmModalType('answer')
  }

  return (
    <>
      <section className={styles.detail}>
        <div className="container">
          <div className={styles.detailActions}>
            <Link to="/archive" className={styles.backLink}>
              목록으로
            </Link>

            {canManage && (
              <button
                type="button"
                className={common.dangerButton}
                disabled={busy}
                onClick={() => setConfirmModalType('deletePost')}
              >
                글 삭제
              </button>
            )}
          </div>

          {actionError && <p role="alert" className={common.error}>{actionError}</p>}

          <article className={styles.postCard}>
            <header className={styles.postHeader}>
              <div>
                <h1 className={styles.postTitle}>{post.title}</h1>
                <p className={styles.answerCount}>
                  답변 {postAnswers.length}
                </p>
              </div>
            </header>

            <button
              type="button"
              disabled={!canManage || busy}
              className={`${styles.statusButton} ${
                isSolved ? styles.solvedStatus : styles.unsolvedStatus
              }`}
              onClick={() => setConfirmModalType('status')}
              aria-label={canManage ? `${post.title} ${getStatusLabel(nextStatus)} 처리` : `${post.title} ${statusLabel}`}
            >
              <img src={statusIcon} alt="" className={styles.statusIcon} />
              <span>{statusLabel}</span>
            </button>

            <p className={styles.content}>{post.content}</p>

            {post.codeText && (
              <CodeBlock language={post.language} codeText={post.codeText} />
            )}

            <footer className={styles.postMeta}>
              {post.tags && post.tags.length > 0 && (
                <ul className={styles.tagList}>
                  {post.tags.map((tag) => (
                    <li key={tag}># {tag}</li>
                  ))}
                </ul>
              )}

              <time
                className={styles.createdAt}
                dateTime={post.createdAt.replaceAll('.', '-')}
              >
                작성일 {post.createdAt}
              </time>
            </footer>
          </article>

          <section className={styles.answerSection}>
            <h2 className={styles.answerTitle}>답변</h2>

            {canManage && <form className={styles.answerForm} onSubmit={handleAnswerSubmit}>
              <textarea
                className={styles.answerInput}
                value={answerInput}
                onChange={(event) => setAnswerInput(event.target.value)}
                placeholder="답변 본문을 작성해주세요."
                aria-label="답변 작성"
                rows={3}
                maxLength={50000}
                required
                disabled={busy}
              />
              <details className={styles.optionalCode}>
                <summary>코드 추가 (선택)</summary>
                <fieldset className={styles.codeFields} disabled={busy}>
                  <legend className={styles.codeLegend}>답변 코드</legend>
                  <Dropdown
                    className={styles.languageDropdown}
                    value={answerLanguage}
                    options={codeLanguageOptions}
                    placeholder="언어 선택 (선택)"
                    onChange={(value) => setAnswerLanguage(value as CodeLanguage | '')}
                  />
                  <textarea
                    className={`${styles.answerInput} ${styles.codeInput}`}
                    value={answerCode}
                    onChange={(event) => setAnswerCode(event.target.value)}
                    placeholder="코드를 입력해주세요."
                    aria-label="답변 코드 (선택)"
                    rows={6}
                    maxLength={50000}
                    spellCheck={false}
                  />
                </fieldset>
              </details>
              <button type="submit" className={styles.saveButton} disabled={busy || !answerInput.trim()}>
                {busy ? '저장 중…' : '저장'}
              </button>
            </form>}
            {postAnswers.length === 0 && <p className={common.message}>아직 작성된 답변이 없습니다.</p>}

            <ul className={styles.answerList}>
              {postAnswers.map((answer) => (
                <li key={answer.id}>
                  <article className={styles.answerCard}>
                    <img src="/favicon.svg" alt="" className={styles.avatar} />

                    <div className={styles.answerContent}>
                      <header className={styles.answerHeader}>
                        <strong className={styles.answerLabel}>답변</strong>
                        <time
                          className={styles.answerDate}
                          dateTime={answer.createdAt.replaceAll('.', '-')}
                        >
                          작성일 {answer.createdAt}
                        </time>
                        {canManage && answer.ownerId === user?.id && <button type="button" className={common.dangerButton} disabled={busy} onClick={() => { setTargetAnswerId(answer.id); setConfirmModalType('deleteAnswer') }}>답변 삭제</button>}
                      </header>

                      <div className={styles.answerBody}>
                        <p className={styles.answerText}>{answer.content}</p>
                        {answer.codeText && <CodeBlock language={answer.language} codeText={answer.codeText} />}
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      {canManage && confirmModalType === 'status' && (
        <ConfirmModal
          title={`${getStatusLabel(nextStatus)} 처리하시겠습니까?`}
          description={`언제든 다시 ${getStatusLabel(
            currentStatus,
          )}로 변경할 수 있습니다.`}
          confirmLabel={busy ? '저장 중…' : '확인'}
          onClose={() => { if (!busyRef.current) setConfirmModalType(null) }}
          onConfirm={() => void runMutation(() => setPostStatus(post.id, nextStatus))}
        />
      )}

      {canManage && confirmModalType === 'answer' && (
        <ConfirmModal
          title="해결완료 처리하시겠습니까?"
          description="답변은 저장됩니다. 해결완료를 선택하면 게시글 상태도 함께 변경됩니다."
          cancelLabel="취소"
          secondaryLabel={busy ? '저장 중…' : '그냥 저장'}
          confirmLabel={busy ? '저장 중…' : '해결완료'}
          onClose={closeAnswerConfirmModal}
          onSecondary={() => saveAnswer(false)}
          onConfirm={() => saveAnswer(true)}
        />
      )}
      {canManage && confirmModalType === 'deletePost' && <ConfirmModal
        title="게시글을 삭제하시겠습니까?" description="게시글과 연결된 답변이 함께 삭제됩니다. 삭제한 내용은 복구할 수 없습니다."
        confirmLabel={busy ? '삭제 중…' : '삭제'}
        onClose={() => { if (!busyRef.current) setConfirmModalType(null) }}
        onConfirm={() => void runMutation(() => deletePost(post.id), () => navigate('/archive', { replace: true }))}
      />}
      {canManage && confirmModalType === 'deleteAnswer' && targetAnswerId && <ConfirmModal
        title="답변을 삭제하시겠습니까?" description="삭제한 답변은 복구할 수 없습니다. 게시글의 해결 상태는 유지됩니다."
        confirmLabel={busy ? '삭제 중…' : '삭제'}
        onClose={() => { if (!busyRef.current) setConfirmModalType(null) }}
        onConfirm={() => void runMutation(() => deleteAnswer(targetAnswerId))}
      />}
    </>
  )
}

export default ArchiveDetail
