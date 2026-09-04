import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SETUP_KEY = 'ltos-waba-subscribe-4sep26-5f29d8'
const WABA_ID = '1344390571129742'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

async function graph(url: string, token: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => ({}))
  return { ok: response.ok, status: response.status, data }
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('key') !== SETUP_KEY) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const version = requiredEnv('WHATSAPP_GRAPH_API_VERSION')
    const accessToken = requiredEnv('WHATSAPP_ACCESS_TOKEN')
    const base = `https://graph.facebook.com/${version}`
    const before = await graph(`${base}/${WABA_ID}/subscribed_apps`, accessToken)

    if (!before.ok) {
      return NextResponse.json({ ok: false, step: 'read_before', status: before.status, data: before.data }, { status: 502 })
    }

    const alreadySubscribed = Array.isArray(before.data?.data)
      && before.data.data.some((item: { id?: string }) => item?.id === '1608994384229587')

    if (alreadySubscribed) {
      return NextResponse.json({ ok: true, alreadySubscribed: true, subscriptions: before.data?.data })
    }

    const subscribe = await graph(`${base}/${WABA_ID}/subscribed_apps`, accessToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const after = subscribe.ok
      ? await graph(`${base}/${WABA_ID}/subscribed_apps`, accessToken)
      : null

    return NextResponse.json({
      ok: subscribe.ok && Boolean(after?.ok),
      alreadySubscribed: false,
      subscribeStatus: subscribe.status,
      subscribe: subscribe.data,
      subscriptions: after?.data?.data,
    }, { status: subscribe.ok && after?.ok ? 200 : 502 })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
