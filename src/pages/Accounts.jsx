import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Network, CornerDownLeft } from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import AccountFormModal from '../components/accounts/AccountFormModal'
import { useSeededCollection } from '../hooks/useSeededCollection'
import { COLLECTIONS } from '../lib/storage'
import { DEFAULT_ACCOUNTS } from '../data/defaults'

const TYPE_ORDER = ['أصول', 'خصوم', 'حقوق ملكية', 'إيرادات', 'مصروفات']
const TYPE_TONE = { أصول: 'primary', خصوم: 'danger', 'حقوق ملكية': 'accent', إيرادات: 'success', مصروفات: 'warning' }

function buildTree(accounts) {
  const byParent = new Map()
  for (const acc of accounts) {
    const key = acc.parentId || 'root'
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key).push(acc)
  }
  const sortByCode = (list) => [...list].sort((a, b) => a.code.localeCompare(b.code))

  function renderChildren(parentId, depth) {
    const children = sortByCode(byParent.get(parentId) || [])
    return children.flatMap((acc) => [{ ...acc, depth }, ...renderChildren(acc.id, depth + 1)])
  }
  return renderChildren('root', 0)
}

export default function Accounts() {
  const { items, loading, add, edit, remove } = useSeededCollection(COLLECTIONS.ACCOUNTS, DEFAULT_ACCOUNTS)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const grouped = useMemo(() => {
    const map = new Map()
    for (const type of TYPE_ORDER) map.set(type, [])
    for (const acc of items) {
      if (!map.has(acc.type)) map.set(acc.type, [])
      map.get(acc.type).push(acc)
    }
    return TYPE_ORDER.map((type) => ({ type, rows: buildTree(map.get(type) || []) }))
  }, [items])

  const hasChildren = (id) => items.some((a) => a.parentId === id)

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (acc) => {
    setEditing(acc)
    setFormOpen(true)
  }

  const handleSave = async (data) => {
    if (editing) await edit(editing.id, data)
    else await add(data)
    setFormOpen(false)
  }

  return (
    <Page
      title="دليل الحسابات"
      subtitle="شجرة الحسابات المحاسبية المستخدمة في القيود والفواتير"
      actions={
        <Button icon={Plus} onClick={openAdd}>
          إضافة حساب
        </Button>
      }
    >
      {!loading && items.length === 0 && (
        <Card>
          <EmptyState icon={Network} title="لا توجد حسابات بعد" />
        </Card>
      )}

      <div className="grid gap-5">
        {grouped.map(
          ({ type, rows }) =>
            rows.length > 0 && (
              <Card key={type} padded={false}>
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
                  <Badge tone={TYPE_TONE[type]}>{type}</Badge>
                  <span className="text-xs text-ink-faint">{rows.length} حساب</span>
                </div>
                <div className="divide-y divide-border">
                  {rows.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="flex items-center gap-2 min-w-0" style={{ paddingInlineStart: acc.depth * 22 }}>
                        {acc.depth > 0 && <CornerDownLeft size={14} className="text-ink-faint shrink-0 -scale-x-100" />}
                        <span className="text-xs text-ink-faint tabular shrink-0">{acc.code}</span>
                        <span className="text-sm font-medium text-ink truncate">{acc.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEdit(acc)} className="p-1.5 rounded-md text-ink-faint hover:text-primary hover:bg-primary-soft">
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmId(acc.id)}
                          className="p-1.5 rounded-md text-ink-faint hover:text-danger hover:bg-danger-soft"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
        )}
      </div>

      <AccountFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initial={editing} accounts={items} />

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (hasChildren(confirmId)) {
            alert('لا يمكن حذف هذا الحساب لأنه يحتوي على حسابات فرعية. احذف الحسابات الفرعية أولًا.')
            return
          }
          remove(confirmId)
        }}
        message="سيتم حذف هذا الحساب نهائيًا. تأكد أنه غير مستخدم في قيود سابقة قبل الحذف."
      />
    </Page>
  )
}
