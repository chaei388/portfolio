import { Link } from 'react-router-dom'
import { useState } from 'react'
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal'
import { archivePosts } from '../../../data/archivePosts'
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
  // 정적 데이터를 화면 상태로 복사해서 버튼 클릭 시 상태 전환을 먼저 확인
  const [posts, setPosts] = useState(archivePosts)
  const [selectedStatus, setSelectedStatus] = useState<PostStatus | null>(
    null,
  )
  // 상태 변경 확인 모달이 열려 있는 게시글 id
  const [targetPostId, setTargetPostId] = useState<string | null>(null)

  const filteredPosts = selectedStatus
    ? posts.filter((post) => post.status === selectedStatus)
    : posts

  const targetPost =
    posts.find((post) => post.id === targetPostId) ?? null
  const nextStatus = targetPost ? getNextStatus(targetPost.status) : null

  const handleFilterClick = (status: PostStatus) => {
    // 같은 필터를 한 번 더 누르면 전체 목록으로 돌아감
    setSelectedStatus((currentStatus) =>
      currentStatus === status ? null : status,
    )
  }

  const handleStatusConfirm = () => {
    if (!targetPost) return

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === targetPost.id
          ? { ...post, status: getNextStatus(post.status) }
          : post,
      ),
    )
    setTargetPostId(null)
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

            <Link to="/archive/new" className={styles.writeButton}>
              새 글 작성
            </Link>
          </div>

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
                          <ul className={styles.tagList}>
                            {post.tags.map((tag) => (
                              <li key={tag}># {tag}</li>
                            ))}
                          </ul>

                          <time dateTime={post.createdAt.replaceAll('.', '-')}>
                            작성일 {post.createdAt}
                          </time>
                        </div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      className={`${styles.statusButton} ${
                        isSolved ? styles.solvedStatus : styles.unsolvedStatus
                      }`}
                      onClick={() => setTargetPostId(post.id)}
                      aria-label={`${post.title} ${getStatusLabel(
                        getNextStatus(post.status),
                      )} 처리`}
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
          onClose={() => setTargetPostId(null)}
          onConfirm={handleStatusConfirm}
        />
      )}
    </>
  )
}

export default ArchiveList
