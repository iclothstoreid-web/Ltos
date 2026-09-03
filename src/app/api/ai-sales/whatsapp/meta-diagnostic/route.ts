import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SETUP_KEY = 'ltos-wa-diag-3sep26-b7c1e9'
const APP_ID = '1608994384229587'
const WABA_ID = '1344390571129742'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

async function graph(url: string, token: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
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
    const appSecret = requiredEnv('WHATSAPP_APP_SECRET')
    const phoneNumberId = requiredEnv('WHATSAPP_PHONE_NUMBER_ID')
    const base = `https://graph.facebook.com/${version}`
    const appToken = `${APP_ID}|${appSecret}`

    const [waba, subscribedApps, phone, phoneNumbers, subscriptions] = await Promise.all([
      graph(`${base}/${WABA_ID}?fields=id,name`, accessToken),
      graph(`${base}/${WABA_ID}/subscribed_apps`, accessToken),
      graph(`${base}/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,platform_type,throughput,is_on_biz_app,account_mode`, accessToken),
      graph(`${base}/${WABA_ID}/phone_numbers?fields=id,display_phone_number,verified_name,status,quality_rating,platform_type,is_on_biz_app,account_mode`, accessToken),
      graph(`${base}/${APP_ID}/subscriptions`, appToken),
    ])

    return NextResponse.json({ version, waba, subscribedApps, phone, phoneNumbers, subscriptions })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
