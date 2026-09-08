import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Modal from '../../../../components/common/Modal/Modal'
import type { Project } from '../../../../types/project'
import cardStyles from './ProjectCard.module.css'
import modalStyles from './ProjectModal.module.css'

interface ProjectCardProps {
  project: Project
}

// 모달 타입: 프로젝트 스크린샷 모달 / 프로젝트 리드미(마크다운) 모달 / 모달 닫힘
type ProjectModalType = 'screenshots' | 'readme' | null

function ProjectCard({ project }: ProjectCardProps) {
  // 현재 열려 있는 모달 종류
  const [activeModal, setActiveModal] = useState<ProjectModalType>(null)

  // 이미지 모달에서 현재 보고 있는 스크린샷 순서
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const screenshots = project.screenshotUrls ?? []

  // 대표 이미지가 등록되어 있으면 그 이미지를 사용하고,
  // 대표 이미지가 없지만 상세 이미지가 있으면 첫 번째 상세 이미지를 대신 사용
  const projectThumbnailUrl = project.thumbnailUrl ?? screenshots[0]

  // 대표 이미지와 상세 이미지가 모두 없는 프로젝트에만 기본 파비콘 표시 (임시 이미지)
  const thumbnailUrl = projectThumbnailUrl ?? '/favicon.svg'

  // 실제 프로젝트 이미지와 기본 파비콘에 서로 다른 스타일을 적용하기 위한 값
  // true: 카드의 이미지 영역을 실제 이미지로 채움
  // false: 기본 파비콘을 여백과 함께 작게 표시
  const hasProjectThumbnail = Boolean(projectThumbnailUrl)
  const hasScreenshots = screenshots.length > 0
  const hasReadme = Boolean(project.readmeMd?.trim())

  // GitHub, Demo, Image, README 중 하나라도 있을 때만 버튼 행 노출
  const hasActions =
    Boolean(project.githubUrl) ||
    Boolean(project.demoUrl) ||
    hasScreenshots ||
    hasReadme

  // 이미지 버튼을 누르면 openScreenshotModal 동작
  const openScreenshotModal = () => {
    setCurrentImageIndex(0) // 이미지 모달을 열 때 첫 번째 이미지부터 보여주기 위해 인덱스 0으로 초기화
    setActiveModal('screenshots') // 현재 열린 모달의 종류 'screenshots'으로 바꿈
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  // 이전 이미지
  const showPreviousImage = () => {
    setCurrentImageIndex((index) =>
      // 첫번째 이미지에서 이전을 누르면 마지막 인덱스로 돌아감 (무한 순환)
      index === 0 ? screenshots.length - 1 : index - 1,
    )
  }

  // 다음 이미지
  const showNextImage = () => {
    setCurrentImageIndex((index) =>
      // 마지막 이미지에서 다음을 누르면 0번째 인덱스로 돌아감 (무한 순환)
      index === screenshots.length - 1 ? 0 : index + 1,
    )
  }

  return (
    <>
      <article id={`project-${project.id}`} className={cardStyles.card}>
        {/* 왼쪽 - 대표 이미지 */}
        <div className={cardStyles.media}>
          <img
            src={thumbnailUrl}
            alt={`${project.title} 대표 이미지`}
            // 실제 이미지는 projectThumbnail, 기본 파비콘은 placeholderThumbnail을 적용
            className={`${cardStyles.thumbnail} ${
              hasProjectThumbnail
                ? cardStyles.projectThumbnail
                : cardStyles.placeholderThumbnail
            }`}
            loading="lazy" // 이미지 지연 로딩
            decoding="async" // 이미지 디코딩을 비동기로 처리
          />
        </div>

        {/* 오른쪽 - 프로젝트 본문 */}
        <div className={cardStyles.content}>

          {/* 헤더: 제목 & 수상뱃지 */}
          <header className={cardStyles.cardHeader}>
            <h3 className={cardStyles.cardTitle}>{project.title}</h3>
            {project.award && (
              <span className={cardStyles.awardBadge}>{project.award}</span>
            )}
          </header>

          {/* 기술 스택 */}
          {project.stacks.length > 0 && (
            <ul className={cardStyles.stackList}>
              {project.stacks.map((stack) => (
                <li key={stack} className={cardStyles.stackItem}>
                  {stack}
                </li>
              ))}
            </ul>
          )}

          {/* 한 줄 소개 */}
          <p className={cardStyles.summary}>{project.summary}</p>

          {/* 기간/역할 영역 */}
          <dl className={cardStyles.metaList}>
            <div className={cardStyles.metaItem}>
              <dt>기간</dt>
              <dd>{project.period}</dd>
            </div>

            <div className={cardStyles.metaItem}>
              <dt>역할</dt>
              <dd>{project.role}</dd>
            </div>
          </dl>

          {/* 프로젝트 내용 리스트 */}
          <ul className={cardStyles.featureList}>
            {project.features.map((feature) => (
              <li key={feature} className={cardStyles.featureItem}>
                {feature}
              </li>
            ))}
          </ul>

          {/* 버튼 영역 - hasActions가 true일 때만 해당 영역을 보여줌 */}
          {hasActions && (
            <div
              className={cardStyles.actionList}
              aria-label={`${project.title} 관련 자료`}
            >
              {/* 깃허브 버튼 - GitHub URL이 있을 때만 표시 */}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  className={cardStyles.actionButton}
                  target="_blank" // 새 탭으로 열기
                  rel="noreferrer" // 새로 연 사이트에 현재 페이지 주소를 넘기지 않음 (보안!)
                >
                  GitHub
                </a>
              )}

              {/* 데모 버튼 - Demo URL이 있을 때만 표시 */}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  className={cardStyles.actionButton}
                  target="_blank" // 새 탭으로 열기
                  rel="noreferrer" // 새로 연 사이트에 현재 페이지 주소를 넘기지 않음 (보안!)
                >
                  Demo
                </a>
              )}

              {/* 이미지 버튼 - hasScreenshots가 true일 때(보여줄 이미지가 있을 때)만 표시 */}
              {hasScreenshots && (
                <button
                  type="button"
                  className={cardStyles.actionButton}
                  onClick={openScreenshotModal}
                >
                  Image
                </button>
              )}

              {/* 리드미 버튼 - hasReadme가 true일 때(보여줄 리드미가 있을 때)만 표시 */}
              {hasReadme && (
                <button
                  type="button"
                  className={cardStyles.actionButton}
                  onClick={() => setActiveModal('readme')}
                >
                  README
                </button>
              )}
            </div>
          )}
        </div>
      </article>


      {/* 이미지 모달 */}
      {activeModal === 'screenshots' && hasScreenshots && (
        // 공통 모달 컴포넌트 사용 - title(제목), onClose(닫는 함수), children(내용) 전달
        <Modal title={`${project.title} 이미지`} onClose={closeModal}>
          <div className={modalStyles.imageViewer}>
            <img
              src={screenshots[currentImageIndex]}
              alt={`${project.title} 스크린샷 ${currentImageIndex + 1}`}
              className={modalStyles.projectImage}
              decoding="async" // 이미지 디코딩을 비동기로 처리
            />

            <p className={modalStyles.imageCount}>
              {currentImageIndex + 1} / {screenshots.length}
            </p>

            {screenshots.length > 1 && (
              <div className={modalStyles.imageControls}>
                <button
                  type="button"
                  className={modalStyles.imageButton}
                  onClick={showPreviousImage}
                  aria-label="이전 이미지"
                >
                  {'<'}
                </button>

                <button
                  type="button"
                  className={modalStyles.imageButton}
                  onClick={showNextImage}
                  aria-label="다음 이미지"
                >
                  {'>'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* 리드미 모달 */}
      {activeModal === 'readme' && project.readmeMd && (
        <Modal title={`${project.title} README`} onClose={closeModal}>
          <div className={modalStyles.markdown}>
            {/* 리액트 마크다운 사용해서 예쁘게 보여주기... */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.readmeMd}
            </ReactMarkdown>
          </div>
        </Modal>
      )}
    </>
  )
}

export default ProjectCard
