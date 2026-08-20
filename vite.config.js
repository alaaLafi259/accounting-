import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // مسار نسبي بدلاً من مطلق، حتى يعمل المشروع تلقائيًا سواء نُشر على
  // الجذر (username.github.io) أو داخل مجلد فرعي (username.github.io/repo-name/)
  // دون الحاجة لتعديل هذا الملف يدويًا في كل مرة.
  base: './',
})
