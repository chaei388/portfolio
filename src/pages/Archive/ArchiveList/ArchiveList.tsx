import { Link } from 'react-router-dom'
import { useRef, useState } from 'react'
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal'
import { archiveError, listPosts, setPostStatus } from '../../../lib/archiveApi'
import { useArchiveQuery } from '../../../hooks/useArchiveQuery'
import { useArchiveAuth } from '../useArchiveAuth'
import common from '../ArchiveCommon.module.css'
import type { PostStatus } from '../../../types/archive'
import solvedIcon from '../../../assets/icons/check_solved.svg'
import unsolvedIcon from '../../../assets/icons/check_unsolved.svg'
import styles from './ArchiveList.module.css'

const filterButtons: {
  label: string
  status: PostStatus
}[] = [
  { label: '해결완료', status: 'solved' },
  { label: '미해결', status: 'unsolved' },
]

const getNextStatus = (status: PostStatus): PostStatus =>
  status === 'solved' ? 'unsolved' : 'solved'

const getStatusLabel = (status: PostStatus) =>
  status === 'solved' ? '해결완료' : '미해결'

function ArchiveList() {
  const { user, isAdmin, ready } = useArchiveAuth()
  const { data, loading, error, refresh } = useArchiveQuery(listPosts, `${ready}:${user?.id}:${isAdmin}`)
  const posts = data ?? []
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [actionError, setActionError] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<PostStatus | null>(
    null,
  )
  // 상태 변경 확인 모달이 열려 있는 게시글 id
  const [targetPostId, setTargetPostId] = useState<string | null>(null)

  const filteredPosts = selectedStatus
    ? posts.filter((post) => post.status === selectedStatus)
    : posts

  const targetPost =
    posts.find((post) => post.id === targetPostId && isAdmin && post.ownerId === user?.id) ?? null
  const nextStatus = targetPost ? getNextStatus(targetPost.status) : null

  const handleFilterClick = (status: PostStatus) => {
    // 같은 필터를 한 번 더 누르면 전체 목록으로 돌아감
    setSelectedStatus((currentStatus) =>
      currentStatus === status ? null : status,
    )
  }

  const handleStatusConfirm = async () => {
    if (!targetPost || busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setActionError('')
    try {
      await setPostStatus(targetPost.id, getNextStatus(targetPost.status))
      setTargetPostId(null)
      refresh()
    } catch (cause) {
      setActionError(archiveError(cause))
      setTargetPostId(null)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  return (
    <>
      <section id="archive" className={styles.archive}>
        <div className="container">
          <h1 className={styles.title}>Archive</h1>

          <div className={styles.toolbar}>
            <div
              className={styles.filterList}
              role="group"
              aria-label="Archive 필터"
              data-selected={selectedStatus ?? 'none'}
            >
              {filterButtons.map((button) => {
                const isActive = selectedStatus === button.status

                return (
                  <button
                    key={button.status}
                    type="button"
                    className={styles.filterButton}
                    data-status={button.status}
                    // aria-pressed: 토글 버튼의 선택 여부
                    aria-pressed={isActive}
                    onClick={() => handleFilterClick(button.status)}
                  >
                    {button.label}
                  </button>
                )
              })}
            </div>

            {ready && isAdmin && <Link to="/archive/new" className={styles.writeButton}>
              새 글 작성
            </Link>}
          </div>

          {loading && <p className={common.message} role="status">게시글을 불러오는 중…</p>}
          {error && <div role="alert"><p className={common.error}>{error}</p><button type="button" className={common.button} onClick={refresh}>다시 시도</button></div>}
          {actionError && <p role="alert" className={common.error}>{actionError}</p>}
          {!loading && !error && filteredPosts.length === 0 && <p className={common.message}>{posts.length ? '선택한 상태의 게시글이 없습니다.' : '아직 작성된 게시글이 없습니다.'}</p>}
          <ul className={styles.postList}>
            {filteredPosts.map((post) => {
              const isSolved = post.status === 'solved'
              const statusLabel = isSolved ? '해결완료' : '미해결'
              const statusIcon = isSolved ? solvedIcon : unsolvedIcon

              return (
                <li key={post.id}>
                  <article className={styles.postCard}>
                    <Link
                      to={`/archive/${post.id}`}
                      className={styles.postLink}
                      aria-label={`${post.title} 상세보기`}
                    >
                      <div className={styles.postContent}>
                        <div className={styles.postHeader}>
                          <div>
                            <h2 className={styles.postTitle}>{post.title}</h2>
                            <p className={styles.answerCount}>
                              답변 {post.answerCount}
                            </p>
                          </div>
                        </div>

                        {/* 2줄까지만 보이고, 나머지는 잘림
                        본문 원문을 그대로 렌더링하고, 자르는 건 CSS가 담당 */}
                        <p className={styles.preview}>{post.content}</p>

                        <div className={styles.postMeta}>
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
                        </div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      disabled={!ready || !isAdmin || post.ownerId !== user?.id || busy}
                      className={`${styles.statusButton} ${
                        isSolved ? styles.solvedStatus : styles.unsolvedStatus
                      }`}
                      onClick={() => setTargetPostId(post.id)}
                      aria-label={isAdmin && post.ownerId === user?.id ? `${post.title} ${getStatusLabel(
                        getNextStatus(post.status),
                      )} 처리` : `${post.title} ${statusLabel}`}
                    >
                      <img
                        src={statusIcon}
                        alt=""
                        className={styles.statusIcon}
                      />
                      <span>{statusLabel}</span>
                    </button>
                  </article>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {targetPost && nextStatus && (
        <ConfirmModal
          title={`${getStatusLabel(nextStatus)} 처리하시겠습니까?`}
          description={`언제든 다시 ${getStatusLabel(
            targetPost.status,
          )}로 변경할 수 있습니다.`}
          confirmLabel={busy ? '저장 중…' : '확인'}
          onClose={() => { if (!busyRef.current) setTargetPostId(null) }}
          onConfirm={() => void handleStatusConfirm()}
        />
      )}
    </>
  )
}

export default ArchiveList
