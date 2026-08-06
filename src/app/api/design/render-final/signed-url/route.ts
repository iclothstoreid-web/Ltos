import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canManageMasterData } from '@/lib/design/masterData'
import { fetchRenderFinal, createRenderFinalSignedUrl, RENDER_FINAL_SIGNED_URL_TTL_SECONDS } from '@/lib/design/renderFinal'

// Render Final — Signed URL endpoint (Final Security Refactor, 2026-08-07).
// The ONLY place a Render Final image URL is minted. Design Studio calls
// this every time it needs to (re)display or download the current Render
// Final — never caches/persists the result itself (see renderFinal.ts's own
// doc comment). Server-side by construction: this is a Route Handler, runs
// with the request's own session cookie (createClient() from
// @/lib/supabase/server), and does its own staff-role check before ever
// asking Storage for a signed URL — the storage.objects RLS policy would
// refuse an unauthorized request anyway, but failing fast here keeps the
// error message meaningful instead of a raw Storage error.
//
// Scope: this endpoint only serves Design Studio. It is not wired to
// Production, Customer Journey, or any other module this sprint.

interface SignedUrlRequestBody {
  consultationId?: string
}

export async function POST(req: NextRequest) {
  let body: SignedUrlRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { consultationId } = body
  if (!consultationId) {
    return NextResponse.json({ success: false, error: 'Missing consultationId.' }, { status: 400 })
  }

  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!canManageMasterData(profile?.role)) {
    return NextResponse.json({ success: false, error: 'Not authorized.' }, { status: 403 })
  }

  const renderFinal = await fetchRenderFinal(supabase, consultationId)
  if (!renderFinal) {
    return NextResponse.json({ success: false, error: 'No Render Final saved for this consultation yet.' }, { status: 404 })
  }

  try {
    const signedUrl = await createRenderFinalSignedUrl(supabase, renderFinal.render_storage_path)
    return NextResponse.json({
      success: true,
      signedUrl,
      expiresInSeconds: RENDER_FINAL_SIGNED_URL_TTL_SECONDS,
      renderStatus: renderFinal.render_status,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create signed URL.'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
