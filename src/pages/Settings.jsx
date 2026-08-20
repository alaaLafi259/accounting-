import { useState, useEffect } from 'react'
import { Save, Download, Upload, AlertTriangle } from 'lucide-react'
import Page from '../components/layout/Page'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useSettings } from '../context/SettingsContext'
import { COLLECTIONS, storage } from '../lib/storage'

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)

  useEffect(() => setForm(settings), [settings])

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    await updateSettings({
      companyName: form.companyName,
      taxRate: Number(form.taxRate) || 0,
      invoicePrefix: form.invoicePrefix,
      journalPrefix: form.journalPrefix,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = async () => {
    const data = {}
    for (const collection of Object.values(COLLECTIONS)) {
      data[collection] = await storage.getAll(collection)
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `نسخة-احتياطية-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        for (const [collection, items] of Object.entries(data)) {
          if (Array.isArray(items)) await storage.replaceAll(collection, items)
        }
        window.location.reload()
      } catch {
        alert('تعذّرت قراءة ملف النسخة الاحتياطية. تأكد من أنه ملف صحيح تم تصديره من هذا النظام.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <Page title="الإعدادات" subtitle="بيانات المؤسسة، نسبة الضريبة، ونسخ البيانات الاحتياطي">
      <div className="grid gap-5 max-w-2xl">
        <Card title="بيانات المؤسسة">
          <div className="space-y-4">
            <Input label="اسم المؤسسة" value={form.companyName || ''} onChange={handleChange('companyName')} />
          </div>
        </Card>

        <Card title="الإعدادات الضريبية">
          <div className="space-y-4">
            <Input
              type="number"
              min="0"
              step="0.1"
              label="نسبة ضريبة القيمة المضافة (%)"
              value={form.taxRate ?? 15}
              onChange={handleChange('taxRate')}
              hint="تُستخدم هذه النسبة تلقائيًا في الفواتير والحاسبة المحاسبية، ويمكن تغييرها في أي وقت."
            />
            <div className="flex items-start gap-2 text-xs text-warning bg-warning-soft border border-warning/20 rounded-lg p-3">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>
                هذا النظام أداة مساعدة لحساب الضريبة والمبالغ فقط، ولا تُعد نتائجه إقرارًا ضريبيًا رسميًا. يُرجى
                مراجعة الجهات المختصة (هيئة الزكاة والضريبة والجمارك) عند إعداد الإقرارات الرسمية.
              </p>
            </div>
          </div>
        </Card>

        <Card title="ترقيم المستندات">
          <div className="grid grid-cols-2 gap-4">
            <Input label="بادئة رقم الفاتورة" value={form.invoicePrefix || ''} onChange={handleChange('invoicePrefix')} />
            <Input label="بادئة رقم القيد" value={form.journalPrefix || ''} onChange={handleChange('journalPrefix')} />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button icon={Save} onClick={handleSave}>
            حفظ الإعدادات
          </Button>
          {saved && <span className="text-sm text-success">تم الحفظ بنجاح</span>}
        </div>

        <Card title="النسخ الاحتياطي للبيانات">
          <p className="text-sm text-ink-soft mb-4">
            جميع بيانات النظام محفوظة محليًا داخل هذا المتصفح فقط. يُنصح بأخذ نسخة احتياطية دوريًا، خاصة قبل مسح
            بيانات المتصفح أو تغيير الجهاز.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" icon={Download} onClick={handleExport}>
              تنزيل نسخة احتياطية (JSON)
            </Button>
            <Button variant="outline" icon={Upload} onClick={() => document.getElementById('import-file').click()}>
              استيراد نسخة احتياطية
            </Button>
            <input id="import-file" type="file" accept="application/json" className="hidden" onChange={handleImport} />
          </div>
        </Card>
      </div>
    </Page>
  )
}
