import Modal from '../Modal/Modal'
import styles from './ConfirmModal.module.css'

interface ConfirmModalProps {
  title: string // 확인 모달 제목
  description: string // 확인 전 안내 문구
  cancelLabel?: string // 취소 버튼 문구
  confirmLabel?: string // 확인 버튼 문구
  onCancel: () => void // 취소 또는 바깥 영역 클릭 시 실행
  onConfirm: () => void // 확인 버튼 클릭 시 실행
}

function ConfirmModal({
  title,
  description,
  cancelLabel = '취소',
  confirmLabel = '확인',
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal title={title} onClose={onCancel} size="small">
      <p className={styles.description}>{description}</p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
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
