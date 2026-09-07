import { useState, type FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams } from 'react-router-dom'
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal'
import { archiveAnswers } from '../../../data/archiveAnswers'
import { codeLanguageOptions } from '../../../data/archiveLanguages'
import { archivePosts } from '../../../data/archivePosts'
import type {
  Answer,
  AnswerBlock,
  CodeLanguage,
  PostStatus,
} from '../../../types/archive'
import solvedIcon from '../../../assets/icons/check_solved.svg'
import unsolvedIcon from '../../../assets/icons/check_unsolved.svg'
import styles from './ArchiveDetail.module.css'

type ConfirmModalType = 'status' | 'answer' | null

const getNextStatus = (status: PostStatus): PostStatus =>
  status === 'solved' ? 'unsolved' : 'solved'

const getStatusLabel = (status: PostStatus) =>
  status === 'solved' ? '해결완료' : '미해결'

const getTodayText = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const date = String(today.getDate()).padStart(2, '0')

  return `${year}.${month}.${date}`
}

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

function AnswerBlock({ block }: { block: AnswerBlock }) {
  if (block.type === 'code') {
    return <CodeBlock language={block.language} codeText={block.codeText} />
  }

  return (
    <div className={styles.markdownText}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text}</ReactMarkdown>
    </div>
  )
}

function ArchiveDetail() {
  const { id } = useParams()
  const post = archivePosts.find((archivePost) => archivePost.id === id)
  const savedAnswers = archiveAnswers.filter(
    (answer) => answer.postId === id,
  )

  // 상세 화면에서 먼저 상태 전환을 확인하기 위한 로컬 상태
  const [statusById, setStatusById] = useState<Record<string, PostStatus>>({})
  const [confirmModalType, setConfirmModalType] =
    useState<ConfirmModalType>(null)
  const [answerInput, setAnswerInput] = useState('')
  const [pendingAnswer, setPendingAnswer] = useState('')
  const [localAnswers, setLocalAnswers] = useState<Answer[]>([])

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

  const currentStatus = statusById[post.id] ?? post.status
  const nextStatus = getNextStatus(currentStatus)
  const isSolved = currentStatus === 'solved'
  const statusLabel = getStatusLabel(currentStatus)
  const statusIcon = isSolved ? solvedIcon : unsolvedIcon
  const postAnswers = [
    ...savedAnswers,
    ...localAnswers.filter((answer) => answer.postId === post.id),
  ]

  const handleStatusConfirm = () => {
    setStatusById((currentStatusById) => ({
      ...currentStatusById,
      [post.id]: nextStatus,
    }))
    setConfirmModalType(null)
  }

  const saveAnswer = (shouldMarkSolved: boolean) => {
    // 추후 Supabase 연동 시 이 부분을 insert 요청으로 교체
    setLocalAnswers((currentAnswers) => [
      ...currentAnswers,
      {
        id: `local-answer-${Date.now()}`,
        postId: post.id,
        blocks: [{ type: 'paragraph', text: pendingAnswer }],
        createdAt: getTodayText(),
      },
    ])

    if (shouldMarkSolved) {
      setStatusById((currentStatusById) => ({
        ...currentStatusById,
        [post.id]: 'solved',
      }))
    }

    setAnswerInput('')
    setPendingAnswer('')
    setConfirmModalType(null)
  }

  const closeAnswerConfirmModal = () => {
    setPendingAnswer('')
    setConfirmModalType(null)
  }

  const handleAnswerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedAnswer = answerInput.trim()

    if (!trimmedAnswer) {
      return
    }

    // 저장 전 해결완료 처리 여부를 사용자가 직접 선택
    setPendingAnswer(trimmedAnswer)
    setConfirmModalType('answer')
  }

  return (
    <>
      <section className={styles.detail}>
        <div className="container">
          <Link to="/archive" className={styles.backLink}>
            목록으로
          </Link>

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
              className={`${styles.statusButton} ${
                isSolved ? styles.solvedStatus : styles.unsolvedStatus
              }`}
              onClick={() => setConfirmModalType('status')}
              aria-label={`${post.title} ${getStatusLabel(nextStatus)} 처리`}
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

            <form className={styles.answerForm} onSubmit={handleAnswerSubmit}>
              <input
                type="text"
                className={styles.answerInput}
                value={answerInput}
                onChange={(event) => setAnswerInput(event.target.value)}
                placeholder="답변을 작성해주세요."
                aria-label="답변 작성"
              />
              <button type="submit" className={styles.saveButton}>
                저장
              </button>
            </form>

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
                      </header>

                      <div className={styles.answerBody}>
                        {answer.blocks.map((block, index) => (
                          <AnswerBlock
                            key={`${answer.id}-${index}`}
                            block={block}
                          />
                        ))}
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      {confirmModalType === 'status' && (
        <ConfirmModal
          title={`${getStatusLabel(nextStatus)} 처리하시겠습니까?`}
          description={`언제든 다시 ${getStatusLabel(
            currentStatus,
          )}로 변경할 수 있습니다.`}
          onClose={() => setConfirmModalType(null)}
          onConfirm={handleStatusConfirm}
        />
      )}

      {confirmModalType === 'answer' && (
        <ConfirmModal
          title="해결완료 처리하시겠습니까?"
          description="답변은 저장됩니다. 해결완료를 선택하면 게시글 상태도 함께 변경됩니다."
          cancelLabel="취소"
          secondaryLabel="그냥 저장"
          confirmLabel="해결완료"
          onClose={closeAnswerConfirmModal}
          onSecondary={() => saveAnswer(false)}
          onConfirm={() => saveAnswer(true)}
        />
      )}
    </>
  )
}

export default ArchiveDetail
