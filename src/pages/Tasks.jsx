import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, ListChecks, Clock, AlertTriangle } from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { Input, Select, Textarea } from '../components/ui/Field'
import { useCollection } from '../hooks/useCollection'
import { COLLECTIONS } from '../lib/storage'
import { formatDate, todayISO } from '../lib/format'
import { TASK_PRIORITIES, TASK_STATUSES } from '../data/defaults'

const EMPTY_FORM = { title: '', dueDate: todayISO(), priority: 'medium', status: 'pending', notes: '' }

const PRIORITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' }
const STATUS_TONE = { pending: 'neutral', in_progress: 'primary', done: 'success' }

function isOverdue(task) {
  if (task.status === 'done') return false
  return new Date(task.dueDate) < new Date(new Date().toDateString())
}

export default function Tasks() {
  const { items, loading, add, edit, remove } = useCollection(COLLECTIONS.TASKS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmId, setConfirmId] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    let list = [...items]
    if (filter === 'pending') list = list.filter((t) => t.status !== 'done')
    if (filter === 'done') list = list.filter((t) => t.status === 'done')
    if (filter === 'overdue') list = list.filter(isOverdue)
    return list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [items, filter])

  const counts = useMemo(
    () => ({
      total: items.length,
      done: items.filter((t) => t.status === 'done').length,
      overdue: items.filter(isOverdue).length,
    }),
    [items]
  )

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }
  const openEdit = (t) => {
    setEditingId(t.id)
    setForm({ title: t.title, dueDate: t.dueDate, priority: t.priority, status: t.status, notes: t.notes || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) await edit(editingId, form)
    else await add(form)
    setModalOpen(false)
  }

  const toggleDone = async (t) => {
    await edit(t.id, { status: t.status === 'done' ? 'pending' : 'done' })
  }

  return (
    <Page
      title="إدارة المهام"
      subtitle="متابعة المهام المحاسبية اليومية ومواعيد استحقاقها"
      actions={
        <Button icon={Plus} onClick={openAdd}>
          إضافة مهمة
        </Button>
      }
    >
      <div className="grid grid-cols-3 gap-4 mb-5">
        <Card className="!p-4 text-center">
          <p className="text-2xl font-display font-bold text-ink tabular">{counts.total}</p>
          <p className="text-xs text-ink-soft mt-1">إجمالي المهام</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-display font-bold text-success tabular">{counts.done}</p>
          <p className="text-xs text-ink-soft mt-1">مهام مكتملة</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-display font-bold text-danger tabular">{counts.overdue}</p>
          <p className="text-xs text-ink-soft mt-1">مهام متأخرة</p>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 border-b border-border flex gap-2 overflow-x-auto scrollbar-thin">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'غير مكتملة' },
            { id: 'overdue', label: 'متأخرة' },
            { id: 'done', label: 'مكتملة' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors
                ${filter === f.id ? 'bg-primary text-white border-primary' : 'border-border text-ink-soft hover:bg-surface-alt'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {!loading && filtered.length === 0 && (
            <EmptyState icon={ListChecks} title="لا توجد مهام في هذه القائمة" description="أضف مهمة جديدة لمتابعتها هنا." />
          )}
          <div className="space-y-2">
            {filtered.map((t) => {
              const overdue = isOverdue(t)
              return (
                <div
                  key={t.id}
                  className={`flex items-start gap-3 rounded-lg border p-3.5 ${
                    overdue ? 'border-danger/30 bg-danger-soft/40' : 'border-border'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={t.status === 'done'}
                    onChange={() => toggleDone(t)}
                    className="mt-1 w-4 h-4 accent-primary shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-ink-faint' : 'text-ink'}`}>
                        {t.title}
                      </p>
                      <Badge tone={PRIORITY_TONE[t.priority]}>
                        {TASK_PRIORITIES.find((p) => p.value === t.priority)?.label}
                      </Badge>
                      <Badge tone={STATUS_TONE[t.status]}>{TASK_STATUSES.find((s) => s.value === t.status)?.label}</Badge>
                      {overdue && (
                        <Badge tone="danger">
                          <AlertTriangle size={11} /> متأخرة
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-soft mt-1.5">
                      <Clock size={12} />
                      <span className="tabular">{formatDate(t.dueDate)}</span>
                    </div>
                    {t.notes && <p className="text-xs text-ink-soft mt-1.5">{t.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-md text-ink-faint hover:text-primary hover:bg-primary-soft">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setConfirmId(t.id)} className="p-1.5 rounded-md text-ink-faint hover:text-danger hover:bg-danger-soft">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="عنوان المهمة" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="تاريخ الاستحقاق"
              required
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
            <Select
              label="الأولوية"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              options={TASK_PRIORITIES}
            />
          </div>
          <Select
            label="حالة المهمة"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            options={TASK_STATUSES}
          />
          <Textarea label="ملاحظات" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">{editingId ? 'حفظ التعديلات' : 'إضافة'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => remove(confirmId)}
        message="سيتم حذف هذه المهمة نهائيًا."
      />
    </Page>
  )
}
