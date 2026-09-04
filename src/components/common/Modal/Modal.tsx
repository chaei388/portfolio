import type { ReactNode } from 'react'
import styles from './Modal.module.css'
import closeIcon from '../../../assets/icons/close.svg'

interface ModalProps {
  title: string // 제목
  onClose: () => void // 모달 닫는 함수
  children: ReactNode // 본문(내용) - ReactNode로 다양한 형태 가능
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <>
    {/* 모달 바깥 영역을 클릭하면 onClose 실행 */}
      <div className={styles.backdrop} onClick={onClose}>
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(event) => event.stopPropagation()}

          // stopPropagation(): 모달 내부에서 발생한 클릭 이벤트가 부모 요소인 backdrop까지 전달되지 않도록 막음
          // backdrop에는 onClick={onClose}가 있기 때문에 클릭 이벤트가 전달되면 모달이 닫힘
        >
          <header className={styles.header}>
            <h3 id="modal-title" className={styles.title}>
              {title}
            </h3>

            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="모달 닫기"
            >
              <img src={closeIcon} alt="" />
            </button>
          </header>

          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </>
  )
}

export default Modal
