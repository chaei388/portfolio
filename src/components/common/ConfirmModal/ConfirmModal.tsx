import Modal from '../Modal/Modal'
import styles from './ConfirmModal.module.css'

interface ConfirmModalProps {
  title: string // 확인 모달 제목
  description: string // 확인 전 안내 문구
  cancelLabel?: string // 취소 버튼 문구
  secondaryLabel?: string // 선택 버튼 문구
  confirmLabel?: string // 확인 버튼 문구
  onClose: () => void // 취소 버튼, X 버튼, 바깥 클릭 시 실행되는 닫기 함수
  onSecondary?: () => void // 선택 버튼 클릭 시 실행
  onConfirm: () => void // 확인 버튼 클릭 시 실행
}

function ConfirmModal({
  title,
  description,
  cancelLabel = '취소',
  secondaryLabel,
  confirmLabel = '확인',
  onClose,
  onSecondary,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal title={title} onClose={onClose} size="small">
      <p className={styles.description}>{description}</p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onClose}
        >
          {cancelLabel}
        </button>
        {secondaryLabel && onSecondary && (
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        )}
        <button
          type="button"
          className={styles.confirmButton}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmModal
