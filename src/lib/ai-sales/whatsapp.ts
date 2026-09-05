import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import type { WhatsAppInboundMessage } from './types'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} environment variable.`)
  return value
}

export function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader?.startsWith('sha256=')) return false

  const secret = requiredEnv('WHATSAPP_APP_SECRET')
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(signatureHeader)

  if (expectedBuffer.length !== suppliedBuffer.length) return false
  return timingSafeEqual(expectedBuffer, suppliedBuffer)
}

export function verifyWhatsAppChallenge(params: URLSearchParams): string | null {
  const mode = params.get('hub.mode')
  const token = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')

  if (mode !== 'subscribe' || token !== requiredEnv('WHATSAPP_VERIFY_TOKEN') || !challenge) return null
  return challenge
}

function interactiveText(message: Record<string, any>): string | null {
  const interactive = message.interactive
  if (!interactive || typeof interactive !== 'object') return null
  if (interactive.button_reply?.title) return String(interactive.button_reply.title)
  if (interactive.list_reply?.title) return String(interactive.list_reply.title)
  return null
}

export function parseWhatsAppInboundMessages(payload: unknown): WhatsAppInboundMessage[] {
  if (!payload || typeof payload !== 'object') return []
  const root = payload as Record<string, any>
  const results: WhatsAppInboundMessage[] = []

  for (const entry of Array.isArray(root.entry) ? root.entry : []) {
    for (const change of Array.isArray(entry?.changes) ? entry.changes : []) {
      const messages = Array.isArray(change?.value?.messages) ? change.value.messages : []
      for (const message of messages) {
        const id = typeof message?.id === 'string' ? message.id : null
        const from = typeof message?.from === 'string' ? message.from : null
        if (!id || !from) continue

        const type = typeof message.type === 'string' ? message.type : 'unknown'
        const text =
          type === 'text' && typeof message.text?.body === 'string'
            ? message.text.body.trim()
            : type === 'interactive'
              ? interactiveText(message)?.trim() ?? ''
              : ''

        results.push({
          providerMessageId: id,
          from,
          timestamp: typeof message.timestamp === 'string' ? message.timestamp : null,
          type,
          text,
          rawPayload: message as Record<string, unknown>,
        })
      }
    }
  }

  return results
}

export async function sendWhatsAppText(to: string, body: string): Promise<string | null> {
  const accessToken = requiredEnv('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = requiredEnv('WHATSAPP_PHONE_NUMBER_ID')
  const graphVersion = requiredEnv('WHATSAPP_GRAPH_API_VERSION')

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body },
    }),
    cache: 'no-store',
  })

  const data = (await response.json().catch(() => ({}))) as Record<string, any>
  if (!response.ok) {
    const providerMessage = data?.error?.message ? `: ${String(data.error.message)}` : ''
    throw new Error(`WhatsApp send failed (${response.status})${providerMessage}`)
  }

  const id = Array.isArray(data.messages) ? data.messages[0]?.id : null
  return typeof id === 'string' ? id : null
}
