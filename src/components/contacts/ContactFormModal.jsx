import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input, Textarea } from '../ui/Field'

const EMPTY = { name: '', phone: '', email: '', notes: '' }

export default function ContactFormModal({ open, onClose, onSave, initial, title }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    setForm(initial ? { name: initial.name, phone: initial.phone || '', email: initial.email || '', notes: initial.notes || '' } : EMPTY)
  }, [open, initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="الاسم" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="رقم الجوال" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input type="email" label="البريد الإلكتروني" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <Textarea label="ملاحظات" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit">{initial ? 'حفظ التعديلات' : 'إضافة'}</Button>
        </div>
      </form>
    </Modal>
  )
}
