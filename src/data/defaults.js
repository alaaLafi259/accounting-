/**
 * قوائم افتراضية قابلة للتعديل والحذف والإضافة بالكامل من المستخدم.
 * تُستخدم فقط لتعبئة القوائم المنسدلة أول مرة عند عدم وجود أي بيانات محفوظة،
 * وليست بيانات تشغيلية وهمية (لا فواتير ولا حركات ولا قيود جاهزة).
 */

export const DEFAULT_EXPENSE_CATEGORIES = [
  'رواتب وأجور',
  'إيجار',
  'مرافق (كهرباء وماء واتصالات)',
  'صيانة ومعدات',
  'نقل ومواصلات',
  'مستلزمات مكتبية',
  'ضرائب ورسوم حكومية',
  'أخرى',
]

export const DEFAULT_INCOME_CATEGORIES = [
  'مبيعات',
  'تنفيذ مشاريع',
  'خدمات استشارية',
  'إيرادات أخرى',
]

export const DEFAULT_ACCOUNTS = [
  { code: '1000', name: 'الصندوق (نقدية)', type: 'أصول', parentId: null },
  { code: '1010', name: 'البنك', type: 'أصول', parentId: null },
  { code: '1100', name: 'العملاء (ذمم مدينة)', type: 'أصول', parentId: null },
  { code: '2000', name: 'الموردون (ذمم دائنة)', type: 'خصوم', parentId: null },
  { code: '2100', name: 'ضريبة القيمة المضافة المستحقة', type: 'خصوم', parentId: null },
  { code: '3000', name: 'رأس المال', type: 'حقوق ملكية', parentId: null },
  { code: '4000', name: 'إيرادات المبيعات', type: 'إيرادات', parentId: null },
  { code: '5000', name: 'مصروفات تشغيلية', type: 'مصروفات', parentId: null },
]

export const TASK_PRIORITIES = [
  { value: 'high', label: 'عالية' },
  { value: 'medium', label: 'متوسطة' },
  { value: 'low', label: 'منخفضة' },
]

export const TASK_STATUSES = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'done', label: 'مكتملة' },
]
