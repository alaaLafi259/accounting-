import { useEffect, useRef } from 'react'
import { useCollection } from './useCollection'

/**
 * مثل useCollection تمامًا، لكنه يضيف عناصر افتراضية تلقائيًا مرة واحدة فقط
 * إذا كانت المجموعة فارغة تمامًا (أول استخدام للنظام) — تبقى بعدها قابلة
 * للتعديل والحذف والإضافة بالكامل من المستخدم كأي بيانات عادية.
 */
export function useSeededCollection(collectionName, defaultItems) {
  const collection = useCollection(collectionName)
  const seeded = useRef(false)

  useEffect(() => {
    if (seeded.current) return
    if (collection.loading) return
    if (collection.items.length > 0) {
      seeded.current = true
      return
    }
    seeded.current = true
    ;(async () => {
      for (const item of defaultItems) {
        await collection.add(item)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection.loading, collection.items.length])

  return collection
}
