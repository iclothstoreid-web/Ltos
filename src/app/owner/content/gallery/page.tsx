import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentRole } from '@/lib/rbac/session'
import { canManageContent } from '@/lib/content/access'
import { fetchAllGalleryItems } from '@/lib/content/galleryItems'
import { fetchWebsiteMedia } from '@/lib/content/websiteMedia'
import { GalleryManager } from '@/components/content/GalleryManager'

export default async function GalleryManagerPage() {
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageContent(role)) redirect('/command-center')

  const supabase = createClient()
  const [items, media] = await Promise.all([
    fetchAllGalleryItems(supabase),
    fetchWebsiteMedia(supabase, { category: 'all' }),
  ])

  return <GalleryManager initialItems={items} initialMedia={media} />
}
