import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'تأكيد الحذف', message }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm text-ink-soft leading-relaxed">{message}</p>
      <div className="flex items-center justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>
          إلغاء
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          حذف نهائي
        </Button>
      </div>
    </Modal>
  )
}
