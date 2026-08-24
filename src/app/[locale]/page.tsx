import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { HomePage } from '@/components/marketing/HomePage'
import { homepageMetadata } from '@/lib/marketing/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
import { getBrandForRequestHost } from '@/lib/brand/resolver'

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(homepageMetadata, FABRIC_SITE_ORIGIN, '/')
}

// Sprint W1 — `/` is now the public luxury homepage for anonymous
// visitors. Authenticated staff keep the exact redirect this route always
// had (straight to their workspace), but Local Tailor must remain public on
// its public marketing host even when a valid session exists.
export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const host = headers().get('host') ?? ''
  const brand = getBrandForRequestHost(host)

  if (user && brand.id !== 'local-tailor') {
    redirect('/workspace/check-in')
  }

  return <HomePage />
}
