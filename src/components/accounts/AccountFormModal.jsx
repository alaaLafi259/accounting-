import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input, Select } from '../ui/Field'

const TYPES = [
  { value: 'أصول', label: 'أصول' },
  { value: 'خصوم', label: 'خصوم' },
  { value: 'حقوق ملكية', label: 'حقوق ملكية' },
  { value: 'إيرادات', label: 'إيرادات' },
  { value: 'مصروفات', label: 'مصروفات' },
]

const EMPTY = { code: '', name: '', type: 'أصول', parentId: '' }

export default function AccountFormModal({ open, onClose, onSave, initial, accounts }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (!open) return
    setForm(initial ? { code: initial.code, name: initial.name, type: initial.type, parentId: initial.parentId || '' } : EMPTY)
  }, [open, initial])

  const parentOptions = accounts
    .filter((a) => a.type === form.type && a.id !== initial?.id)
    .map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, parentId: form.parentId || null })
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'تعديل حساب' : 'إضافة حساب جديد'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="رقم الحساب" required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <Select
            label="نوع الحساب"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, parentId: '' }))}
            options={TYPES}
          />
        </div>
        <Input label="اسم الحساب" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Select
          label="الحساب الرئيسي (اختياري)"
          value={form.parentId}
          onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
          options={parentOptions}
          placeholder="بدون — حساب رئيسي مستقل"
        />
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
