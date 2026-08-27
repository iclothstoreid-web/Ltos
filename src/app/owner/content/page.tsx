import { redirect } from 'next/navigation'
import { getCurrentRole } from '@/lib/rbac/session'
import { canManageContent } from '@/lib/content/access'
import { ContentHub } from '@/components/content/ContentHub'

// Owner OS -> Content hub. Admin/Owner only (same gate as Operators /
// Business Rules — one notch tighter than /owner/master-data). Pure
// navigation, no data of its own.
export default async function OwnerContentPage() {
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageContent(role)) redirect('/command-center')

  return <ContentHub />
}
