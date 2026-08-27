import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentRole } from '@/lib/rbac/session'
import { canManageContent } from '@/lib/content/access'
import { fetchAllJournalArticles } from '@/lib/content/journalArticles'
import { fetchWebsiteMedia } from '@/lib/content/websiteMedia'
import { ArticlesManager } from '@/components/content/ArticlesManager'

export default async function ArticlesManagerPage() {
  const role = await getCurrentRole()
  if (!role) redirect('/owner/login')
  if (!canManageContent(role)) redirect('/command-center')

  const supabase = createClient()
  const [articles, media] = await Promise.all([
    fetchAllJournalArticles(supabase),
    fetchWebsiteMedia(supabase, { category: 'all' }),
  ])

  return <ArticlesManager initialArticles={articles} initialMedia={media} />
}
