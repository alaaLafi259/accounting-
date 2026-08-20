import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import Page from '../components/layout/Page'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <Page title="الصفحة غير موجودة">
      <EmptyState
        icon={FileQuestion}
        title="لم يتم العثور على هذه الصفحة"
        description="الرابط الذي حاولت الوصول إليه غير موجود ضمن النظام."
        action={
          <Link to="/">
            <Button>العودة إلى لوحة التحكم</Button>
          </Link>
        }
      />
    </Page>
  )
}
