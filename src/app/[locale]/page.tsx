import type { Metadata } from 'next'
import { HomePage } from '@/components/marketing/HomePage'
import { homepageMetadata } from '@/lib/marketing/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(homepageMetadata, FABRIC_SITE_ORIGIN, '/')
}

// `/` is the public luxury homepage. LTOS is single-brand (Local Tailor)
// and its public marketing surface stays public for everyone, including
// authenticated staff (who reach their workspace via /owner/login ->
// App Launcher, not via a root redirect). This route previously bounced
// authenticated users to /workspace/check-in on non-Local-Tailor hosts;
// with Tarda removed there is no such host, so the redirect is gone.
export default function RootPage() {
  return <HomePage />
}
