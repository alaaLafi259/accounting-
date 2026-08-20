import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Users, Phone, Mail } from 'lucide-react'
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

export default function Clients() {
  const { items, loading, add: addClient, edit, remove } = useCollection(COLLECTIONS.CLIENTS)
  const { items: invoices } = useCollection(COLLECTIONS.INVOICES)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [search, setSearch] = useState('')

  const balances = useMemo(() => {
    const map = new Map()
    for (const inv of invoices) {
      if (!inv.clientId) continue
      const entry = map.get(inv.clientId) || { outstanding: 0, count: 0 }
      entry.count += 1
      if (inv.status !== 'paid') entry.outstanding = add(entry.outstanding, inv.total)
      map.set(inv.clientId, entry)
    }
    return map
  }, [invoices])

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
    else await addClient(data)
    setFormOpen(false)
  }

  return (
    <Page
      title="قائمة العملاء"
      subtitle="بيانات العملاء والرصيد المستحق تلقائيًا من الفواتير غير المدفوعة"
      actions={
        <Button icon={Plus} onClick={openAdd}>
          إضافة عميل
        </Button>
      }
    >
      <Card padded={false}>
        <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث بالاسم أو الجوال..." className="sm:w-80" />
          <span className="text-sm text-ink-soft">{items.length} عميل</span>
        </div>
        <div className="p-5">
          {!loading && filtered.length === 0 && (
            <EmptyState
              icon={Users}
              title="لا يوجد عملاء بعد"
              description="أضف عملاءك هنا، أو سيتم إنشاؤهم تلقائيًا عند كتابة اسم عميل جديد في أي فاتورة."
              action={
                <Button icon={Plus} onClick={openAdd}>
                  إضافة عميل
                </Button>
              }
            />
          )}
          {filtered.length > 0 && (
            <Table>
              <Thead>
                <Th>الاسم</Th>
                <Th>التواصل</Th>
                <Th className="text-end">عدد الفواتير</Th>
                <Th className="text-end">الرصيد المستحق</Th>
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
                          <Badge tone="danger">{formatCurrency(bal.outstanding)}</Badge>
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
        title={editing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
      />
      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => remove(confirmId)}
        message="سيتم حذف بيانات هذا العميل. الفواتير المرتبطة به ستبقى محفوظة باسمه دون ربط."
      />
    </Page>
  )
}
