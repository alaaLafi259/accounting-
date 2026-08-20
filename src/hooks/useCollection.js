import { useCallback, useEffect, useState } from 'react'
import { storage } from '../lib/storage'
import { generateId } from '../lib/id'

/**
 * خطاف عام للتعامل مع أي مجموعة بيانات (فواتير، مصروفات، مهام...)
 * يوفر: items, loading, add, edit, remove, refresh
 */
export function useCollection(collectionName) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const data = await storage.getAll(collectionName)
    setItems(data)
    setLoading(false)
  }, [collectionName])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = useCallback(
    async (item) => {
      const now = new Date().toISOString()
      const withId = { id: generateId(), createdAt: now, updatedAt: now, ...item }
      await storage.create(collectionName, withId)
      await refresh()
      return withId
    },
    [collectionName, refresh]
  )

  const edit = useCallback(
    async (id, patch) => {
      const updated = await storage.update(collectionName, id, patch)
      await refresh()
      return updated
    },
    [collectionName, refresh]
  )

  const remove = useCallback(
    async (id) => {
      await storage.remove(collectionName, id)
      await refresh()
    },
    [collectionName, refresh]
  )

  return { items, loading, add, edit, remove, refresh }
}
