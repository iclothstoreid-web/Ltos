import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SETUP_KEY = 'ltos-wa-sub-8f4d1c2a7e934b73b1d6'
const WABA_ID = '1344390571129742'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('key') !== SETUP_KEY) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const token = requiredEnv('WHATSAPP_ACCESS_TOKEN')
    const version = requiredEnv('WHATSAPP_GRAPH_API_VERSION')
    const mode = request.nextUrl.searchParams.get('mode') ?? 'status'
    const url = `https://graph.facebook.com/${version}/${WABA_ID}/subscribed_apps`

    const response = await fetch(url, {
      method: mode === 'subscribe' ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json({ mode, ok: response.ok, status: response.status, data }, { status: response.ok ? 200 : 502 })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
