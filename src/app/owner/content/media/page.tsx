import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentRole } from '@/lib/rbac/session'
import { canManageContent } from '@/lib/content/access'
import { fetchWebsiteMedia } from '@/lib/content/websiteMedia'
import { MediaLibrary } from '@/components/content/MediaLibrary'

export default async function MediaLibraryPage() {
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageContent(role)) redirect('/command-center')

  const supabase = createClient()
  const media = await fetchWebsiteMedia(supabase, { category: 'all', includeArchived: true })

  return <MediaLibrary initialMedia={media} />
}
