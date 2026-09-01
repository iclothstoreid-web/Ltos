import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PAYMENT_PROOF_BUCKET } from '@/lib/commercial/paymentProof'

// Payment proof — Signed URL endpoint (Fase 2, Fitter Payment Flow). The
// payment-proofs bucket is private (financial evidence); this is the only
// place a viewable URL for one is minted. Route Handler, runs with the
// request's own session cookie, does its own staff check before asking
// Storage — mirrors /api/design/render-final/signed-url.

const TTL_SECONDS = 60 * 60 // 1 hour

export async function POST(req: NextRequest) {
  let path: string | undefined
  try {
    path = (await req.json())?.path
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }
  if (!path || typeof path !== 'string') {
    return NextResponse.json({ success: false, error: 'Missing path.' }, { status: 400 })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 })
  }
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Not authorized.' }, { status: 403 })
  }

  const { data, error } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .createSignedUrl(path, TTL_SECONDS)
  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create signed URL.' },
      { status: 500 }
    )
  }
  return NextResponse.json({ success: true, signedUrl: data.signedUrl, expiresInSeconds: TTL_SECONDS })
}
