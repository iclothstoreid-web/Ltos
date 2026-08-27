import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentRole } from '@/lib/rbac/session'
import { canManageContent } from '@/lib/content/access'
import { fetchHomepageSlots } from '@/lib/content/homepageMedia'
import { fetchWebsiteMedia } from '@/lib/content/websiteMedia'
import { HomepageManager } from '@/components/content/HomepageManager'

export default async function HomepageManagerPage() {
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageContent(role)) redirect('/command-center')

  const supabase = createClient()
  const [slots, media] = await Promise.all([
    fetchHomepageSlots(supabase),
    fetchWebsiteMedia(supabase, { category: 'all' }),
  ])

  return <HomepageManager initialSlots={slots} initialMedia={media} />
}
