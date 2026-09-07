import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../../../components/common/ConfirmModal/ConfirmModal'
import Dropdown from '../../../components/common/Dropdown/Dropdown'
import { codeLanguageOptions } from '../../../data/archiveLanguages'
import type { CodeLanguage } from '../../../types/archive'
import styles from './ArchiveWrite.module.css'

function ArchiveWrite() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState<CodeLanguage | ''>('')
  const [codeText, setCodeText] = useState('')
  const [tagText, setTagText] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const hasDraft = Boolean(
    title.trim() || content.trim() || codeText.trim() || tagText.trim(),
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedCodeText = codeText.trim()
    const tags = tagText
      .split('#')
      .map((tag) => tag.trim())
      .filter(Boolean)

    // 추후 Supabase 연동 시 이 객체 형태를 insert 요청으로 연결
    const newPost = {
      title,
      content,
      language: trimmedCodeText ? language || null : null,
      codeText: trimmedCodeText || null,
      tags: tags.length > 0 ? tags : null,
    }

    setIsSubmitted(Boolean(newPost.title && newPost.content))
  }

  const handleCancelClick = () => {
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

          <form className={styles.form} onSubmit={handleSubmit}>
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
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancelClick}
              >
                취소
              </button>
              <button type="submit" className={styles.saveButton}>
                저장
              </button>
            </div>

            {isSubmitted && (
              <p className={styles.submitMessage}>
                Supabase 연동 전이라 현재는 저장 흐름만 확인합니다.
              </p>
            )}
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
