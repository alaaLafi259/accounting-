/** توليد معرّف فريد بسيط بدون الاعتماد على مكتبات خارجية */
export function generateId(prefix = '') {
  const time = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return prefix ? `${prefix}_${time}${rand}` : `${time}${rand}`
}
