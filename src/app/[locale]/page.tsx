import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HomePage } from '@/components/marketing/HomePage'
import { homepageMetadata } from '@/lib/marketing/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(homepageMetadata, FABRIC_SITE_ORIGIN, '/')
}

// Sprint W1 — `/` is now the public luxury homepage for anonymous
// visitors. Authenticated staff keep the exact redirect this route always
// had (straight to their workspace), so nothing about the internal login
// flow changes.
export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/workspace/check-in')
  }

  return <HomePage />
}
