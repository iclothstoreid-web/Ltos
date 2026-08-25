import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getCurrentUserProfile } from '@/lib/rbac/session'
import { getSlaRiskOrders } from '@/lib/decision/client'
import { AppLauncher } from '@/components/owner/AppLauncher/AppLauncher'

export const metadata: Metadata = {
  title: 'LTOS | Owner OS',
  robots: { index: false, follow: false },
}

// New post-login home for Owner/Admin — /owner previously had no page.tsx
// (404), and /owner/login redirected straight into /command-center's dense
// dashboard. That dashboard is untouched; it's now just the "Command
// Center" tile below. Same identity pattern as src/app/command-center/
// page.tsx: middleware already verified auth for this route (matcher covers
// /owner/:path*), so this reads the forwarded headers instead of repeating
// auth.getUser() + a profiles lookup.
export default async function OwnerLauncherPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/owner/login')

  const profile = await getCurrentUserProfile()

  const supabase = createClient()
  const slaRiskOrders = await getSlaRiskOrders(supabase)

  return <AppLauncher profileName={profile?.name || 'Pemilik'} slaRiskCount={slaRiskOrders.length} />
}
