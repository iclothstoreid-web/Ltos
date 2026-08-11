import { NextResponse } from 'next/server'
import { getSessionSecretStatus } from '@/lib/configurator/runtimeGuards'

// New diagnostic endpoint (W2-5) — doesn't touch options/estimate/save at
// all. Never returns the secret itself, only whether it's configured and
// strong enough. Useful as a pre-deploy / Vercel health check.
export async function GET() {
  const sessionSecret = getSessionSecretStatus()
  const ok = sessionSecret.ok

  return NextResponse.json(
    {
      ok,
      checks: { sessionSecret },
    },
    { status: ok ? 200 : 503 }
  )
}
