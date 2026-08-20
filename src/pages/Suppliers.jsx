import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Truck, Phone, Mail } from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import SearchInput from '../components/ui/SearchInput'
import Badge from '../components/ui/Badge'
import { Table, Thead, Th, Tr, Td } from '../components/ui/Table'
import ContactFormModal from '../components/contacts/ContactFormModal'
import { useCollection } from '../hooks/useCollection'
import { COLLECTIONS } from '../lib/storage'
import { formatCurrency } from '../lib/format'
import { add } from '../lib/calculations'

export default function Suppliers() {
  const { items, loading, add: addSupplier, edit, remove } = useCollection(COLLECTIONS.SUPPLIERS)
  const { items: transactions } = useCollection(COLLECTIONS.TRANSACTIONS)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [search, setSearch] = useState('')

  const balances = useMemo(() => {
    const map = new Map()
    for (const t of transactions) {
      if (t.type !== 'expense' || !t.supplierId) continue
      const entry = map.get(t.supplierId) || { outstanding: 0, count: 0 }
      entry.count += 1
      if (t.paid === false) entry.outstanding = add(entry.outstanding, t.amount)
      map.set(t.supplierId, entry)
    }
    return map
  }, [transactions])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter((c) => !q || c.name.toLowerCase().includes(q) || (c.phone || '').includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
  }, [items, search])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (c) => {
    setEditing(c)
    setFormOpen(true)
  }
  const handleSave = async (data) => {
    if (editing) await edit(editing.id, data)
    else await addSupplier(data)
    setFormOpen(false)
  }

  return (
    <Page
      title="قائمة الموردين"
      subtitle="بيانات الموردين والمبالغ المستحقة لهم تلقائيًا من المصروفات غير المسددة"
      actions={
        <Button icon={Plus} onClick={openAdd}>
          إضافة مورد
        </Button>
      }
    >
      <Card padded={false}>
        <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث بالاسم أو الجوال..." className="sm:w-80" />
          <span className="text-sm text-ink-soft">{items.length} مورد</span>
        </div>
        <div className="p-5">
          {!loading && filtered.length === 0 && (
            <EmptyState
              icon={Truck}
              title="لا يوجد موردون بعد"
              description="أضف الموردين هنا، أو سيتم إنشاؤهم تلقائيًا عند اختيار مورد جديد في مصروف."
              action={
                <Button icon={Plus} onClick={openAdd}>
                  إضافة مورد
                </Button>
              }
            />
          )}
          {filtered.length > 0 && (
            <Table>
              <Thead>
                <Th>الاسم</Th>
                <Th>التواصل</Th>
                <Th className="text-end">عدد العمليات</Th>
                <Th className="text-end">المستحق له</Th>
                <Th></Th>
              </Thead>
              <tbody>
                {filtered.map((c) => {
                  const bal = balances.get(c.id) || { outstanding: 0, count: 0 }
                  return (
                    <Tr key={c.id}>
                      <Td className="font-medium">{c.name}</Td>
                      <Td>
                        <div className="flex flex-col gap-0.5 text-xs text-ink-soft">
                          {c.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={11} /> {c.phone}
                            </span>
                          )}
                          {c.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={11} /> {c.email}
                            </span>
                          )}
                          {!c.phone && !c.email && '—'}
                        </div>
                      </Td>
                      <Td className="text-end tabular">{bal.count}</Td>
                      <Td className="text-end">
                        {bal.outstanding > 0 ? (
                          <Badge tone="warning">{formatCurrency(bal.outstanding)}</Badge>
                        ) : (
                          <span className="text-ink-faint text-sm">—</span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(c)} className="p-1.5 rounded-md text-ink-faint hover:text-primary hover:bg-primary-soft">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setConfirmId(c.id)} className="p-1.5 rounded-md text-ink-faint hover:text-danger hover:bg-danger-soft">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </div>
      </Card>

      <ContactFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={editing}
        title={editing ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
      />
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => remove(confirmId)}
        message="سيتم حذف بيانات هذا المورد. المصروفات المرتبطة به ستبقى محفوظة دون ربط."
      />
    </Page>
  )
}
