/**
 * طبقة تخزين البيانات (Data Access Layer)
 * -----------------------------------------
 * كل الشاشات والمكوّنات تتعامل حصريًا مع الدوال المُصدَّرة هنا
 * (getAll / getById / create / update / remove / replaceAll)
 * ولا تتعامل مع localStorage مباشرة أبدًا.
 *
 * لماذا هذا التصميم؟
 * لأنه يسمح لاحقًا بربط المشروع بقاعدة بيانات حقيقية (REST API,
 * Firebase, Supabase, ...) عبر إعادة كتابة محتوى هذا الملف فقط،
 * دون الحاجة لتعديل أي صفحة أو مكوّن آخر في المشروع — لأن كل
 * الدوال هنا "async" أصلًا لتحاكي شكل استدعاء API حقيقي.
 */

const NAMESPACE = 'accounting_assistant_v1'

function key(collection) {
  return `${NAMESPACE}:${collection}`
}

function readAll(collection) {
  try {
    const raw = localStorage.getItem(key(collection))
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('تعذّرت قراءة البيانات المخزّنة', collection, err)
    return []
  }
}

function writeAll(collection, items) {
  try {
    localStorage.setItem(key(collection), JSON.stringify(items))
    return true
  } catch (err) {
    console.error('تعذّر حفظ البيانات', collection, err)
    return false
  }
}

export const storage = {
  /** إرجاع كل عناصر مجموعة معيّنة */
  async getAll(collection) {
    return readAll(collection)
  },

  /** إرجاع عنصر واحد عبر المعرّف */
  async getById(collection, id) {
    return readAll(collection).find((item) => item.id === id) || null
  },

  /** إضافة عنصر جديد */
  async create(collection, item) {
    const items = readAll(collection)
    items.unshift(item)
    writeAll(collection, items)
    return item
  },

  /** تعديل عنصر موجود (دمج جزئي) */
  async update(collection, id, patch) {
    const items = readAll(collection)
    const idx = items.findIndex((item) => item.id === id)
    if (idx === -1) throw new Error('العنصر المطلوب تعديله غير موجود')
    items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() }
    writeAll(collection, items)
    return items[idx]
  },

  /** حذف عنصر */
  async remove(collection, id) {
    const items = readAll(collection).filter((item) => item.id !== id)
    writeAll(collection, items)
    return true
  },

  /** استبدال كل عناصر المجموعة دفعة واحدة (يفيد عند الاستيراد) */
  async replaceAll(collection, items) {
    writeAll(collection, items)
    return items
  },
}

export const COLLECTIONS = {
  INVOICES: 'invoices',
  TRANSACTIONS: 'transactions',
  JOURNAL_ENTRIES: 'journal_entries',
  TASKS: 'tasks',
  CATEGORIES: 'categories',
  ACCOUNTS: 'accounts',
  SETTINGS: 'settings',
}
