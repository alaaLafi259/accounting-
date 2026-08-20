/**
 * البحث عن جهة (عميل/مورد) بالاسم، أو إنشاؤها تلقائيًا إن لم تكن موجودة.
 * يُستخدم عند حفظ فاتورة أو عملية مصروف لربطها تلقائيًا بقائمة العملاء/الموردين
 * دون إجبار المستخدم على إدارة القوائم يدويًا أولًا.
 */
export async function findOrCreateByName(items, name, addFn) {
  const trimmed = (name || '').trim()
  if (!trimmed) return null
  const existing = items.find((i) => i.name.trim().toLowerCase() === trimmed.toLowerCase())
  if (existing) return existing.id
  const created = await addFn({ name: trimmed, phone: '', email: '', notes: '' })
  return created.id
}
