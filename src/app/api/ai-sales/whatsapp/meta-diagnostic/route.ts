import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SETUP_KEY = 'ltos-wa-diag-3sep26-b7c1e9'
const APP_ID = '1608994384229587'
const WABA_ID = '1344390571129742'
const CALLBACK_URL = 'https://localtailor.id/api/webhooks/whatsapp'

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

function authorized(request: NextRequest) {
  return request.nextUrl.searchParams.get('key') === SETUP_KEY
}

async function ensureCoexistenceWebhookFields() {
  const version = requiredEnv('WHATSAPP_GRAPH_API_VERSION')
  const appSecret = requiredEnv('WHATSAPP_APP_SECRET')
  const verifyToken = requiredEnv('WHATSAPP_VERIFY_TOKEN')
  const base = `https://graph.facebook.com/${version}`
  const appToken = `${APP_ID}|${appSecret}`

  const existing = await graph(`${base}/${APP_ID}/subscriptions`, appToken)
  if (!existing.ok) return { ok: false, step: 'read_subscriptions', existing }

  const subscription = Array.isArray(existing.data?.data)
    ? existing.data.data.find((item: { object?: string }) => item?.object === 'whatsapp_business_account')
    : undefined

  const currentFields = Array.isArray(subscription?.fields)
    ? subscription.fields.map((field: { name?: string }) => field?.name).filter(Boolean)
    : []

  const requiredFields = ['messages', 'history', 'smb_app_state_sync', 'smb_message_echoes']
  const fields = Array.from(new Set([...currentFields, ...requiredFields]))

  const body = new URLSearchParams({
    object: 'whatsapp_business_account',
    callback_url: CALLBACK_URL,
    fields: fields.join(','),
    verify_token: verifyToken,
    include_values: 'true',
  })

  const response = await fetch(`${base}/${APP_ID}/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${appToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })
  const data = await response.json().catch(() => ({}))

  return { ok: response.ok, status: response.status, fields, data }
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return new NextResponse('Not found', { status: 404 })

  if (request.nextUrl.searchParams.get('action') === 'coexistence-fields') {
    try {
      const result = await ensureCoexistenceWebhookFields()
      return NextResponse.json(result, { status: result.ok ? 200 : 502 })
    } catch (error) {
      return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
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
