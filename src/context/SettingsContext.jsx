import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { storage, COLLECTIONS } from '../lib/storage'

const SETTINGS_ID = 'app_settings'

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  companyName: 'مؤسستي',
  taxRate: 15,
  currency: 'ر.س',
  invoicePrefix: 'INV',
  nextInvoiceNumber: 1,
  journalPrefix: 'JE',
  nextJournalNumber: 1,
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const existing = await storage.getById(COLLECTIONS.SETTINGS, SETTINGS_ID)
      if (!active) return
      if (existing) {
        setSettings({ ...DEFAULT_SETTINGS, ...existing })
      } else {
        await storage.create(COLLECTIONS.SETTINGS, DEFAULT_SETTINGS)
        setSettings(DEFAULT_SETTINGS)
      }
      setLoaded(true)
    })()
    return () => {
      active = false
    }
  }, [])

  const updateSettings = useCallback(async (patch) => {
    const updated = await storage.update(COLLECTIONS.SETTINGS, SETTINGS_ID, patch)
    setSettings(updated)
    return updated
  }, [])

  /** يولد رقم فاتورة جديد ويحفظ العداد التالي */
  const getNextInvoiceNumber = useCallback(async () => {
    const num = settings.nextInvoiceNumber || 1
    const formatted = `${settings.invoicePrefix}-${String(num).padStart(4, '0')}`
    await updateSettings({ nextInvoiceNumber: num + 1 })
    return formatted
  }, [settings, updateSettings])

  /** يولد رقم قيد جديد ويحفظ العداد التالي */
  const getNextJournalNumber = useCallback(async () => {
    const num = settings.nextJournalNumber || 1
    const formatted = `${settings.journalPrefix}-${String(num).padStart(4, '0')}`
    await updateSettings({ nextJournalNumber: num + 1 })
    return formatted
  }, [settings, updateSettings])

  return (
    <SettingsContext.Provider
      value={{ settings, loaded, updateSettings, getNextInvoiceNumber, getNextJournalNumber }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings يجب أن يُستخدم داخل SettingsProvider')
  return ctx
}
