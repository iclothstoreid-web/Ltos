import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import sharp from 'sharp'
import type { WhatsAppInboundMessage, WhatsAppMessageEcho } from './types'

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

export function parseWhatsAppMessageEchoes(payload: unknown): WhatsAppMessageEcho[] {
  if (!payload || typeof payload !== 'object') return []
  const root = payload as Record<string, any>
  const results: WhatsAppMessageEcho[] = []

  for (const entry of Array.isArray(root.entry) ? root.entry : []) {
    for (const change of Array.isArray(entry?.changes) ? entry.changes : []) {
      if (change?.field !== 'smb_message_echoes') continue
      const echoes = Array.isArray(change?.value?.message_echoes) ? change.value.message_echoes : []
      for (const echo of echoes) {
        if (typeof echo?.id !== 'string' || typeof echo?.to !== 'string') continue
        const type = typeof echo.type === 'string' ? echo.type : 'unknown'
        const text = type === 'text' && typeof echo.text?.body === 'string'
          ? echo.text.body.trim()
          : type === 'image' && typeof echo.image?.caption === 'string'
            ? echo.image.caption.trim()
            : ''
        results.push({
          providerMessageId: echo.id,
          to: echo.to,
          type,
          text,
          rawPayload: echo as Record<string, unknown>,
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


const WHATSAPP_IMAGE_MAX_BYTES = 5 * 1024 * 1024

async function uploadWhatsAppImageMedia(
  accessToken: string,
  phoneNumberId: string,
  graphVersion: string,
  imageUrl: string
): Promise<string> {
  const source = await fetch(imageUrl, { cache: 'no-store' })
  if (!source.ok) {
    throw new Error(`WhatsApp image source fetch failed (${source.status})`)
  }

  const sourceMime = (source.headers.get('content-type') ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase()
  let bytes = Buffer.from(await source.arrayBuffer())
  let mime = sourceMime
  let filename = mime === 'image/png' ? 'local-tailor.png' : 'local-tailor.jpg'

  // WhatsApp image messages accept JPEG/PNG only. R2 stores our optimized
  // sales library as WebP, so convert unsupported formats before upload.
  if (!['image/jpeg', 'image/png'].includes(mime) || bytes.byteLength > WHATSAPP_IMAGE_MAX_BYTES) {
    bytes = await sharp(bytes)
      .rotate()
      .resize({ width: 1600, height: 2200, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer()
    mime = 'image/jpeg'
    filename = 'local-tailor.jpg'
  }

  if (bytes.byteLength > WHATSAPP_IMAGE_MAX_BYTES) {
    bytes = await sharp(bytes)
      .jpeg({ quality: 76, mozjpeg: true })
      .toBuffer()
  }

  if (bytes.byteLength > WHATSAPP_IMAGE_MAX_BYTES) {
    throw new Error('WhatsApp image exceeds 5 MB after conversion')
  }

  const form = new FormData()
  form.append('messaging_product', 'whatsapp')
  form.append(
    'file',
    new Blob([new Uint8Array(bytes)], { type: mime }),
    filename
  )

  const upload = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/media`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
      cache: 'no-store',
    }
  )

  const uploadData = (await upload.json().catch(() => ({}))) as Record<string, any>
  if (!upload.ok) {
    const providerMessage = uploadData?.error?.message
      ? `: ${String(uploadData.error.message)}`
      : ''
    throw new Error(`WhatsApp image upload failed (${upload.status})${providerMessage}`)
  }

  const mediaId = typeof uploadData.id === 'string' ? uploadData.id : null
  if (!mediaId) throw new Error('WhatsApp image upload returned no media id')
  return mediaId
}

export async function sendWhatsAppImage(
  to: string,
  imageUrl: string,
  caption?: string
): Promise<string | null> {
  const accessToken = requiredEnv('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = requiredEnv('WHATSAPP_PHONE_NUMBER_ID')
  const graphVersion = requiredEnv('WHATSAPP_GRAPH_API_VERSION')
  const mediaId = await uploadWhatsAppImageMedia(
    accessToken,
    phoneNumberId,
    graphVersion,
    imageUrl
  )

  const image: Record<string, string> = { id: mediaId }
  if (caption?.trim()) image.caption = caption.trim()

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
      type: 'image',
      image,
    }),
    cache: 'no-store',
  })

  const data = (await response.json().catch(() => ({}))) as Record<string, any>
  if (!response.ok) {
    const providerMessage = data?.error?.message ? `: ${String(data.error.message)}` : ''
    throw new Error(`WhatsApp image send failed (${response.status})${providerMessage}`)
  }

  const id = Array.isArray(data.messages) ? data.messages[0]?.id : null
  return typeof id === 'string' ? id : null
}

export async function sendWhatsAppTemplate(
  to: string,
  name: string,
  languageCode: string
): Promise<string | null> {
  const accessToken = requiredEnv('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = requiredEnv('WHATSAPP_PHONE_NUMBER_ID')
  const graphVersion = requiredEnv('WHATSAPP_GRAPH_API_VERSION')
  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'template',
      template: { name, language: { code: languageCode } },
    }),
    cache: 'no-store',
  })
  const data = (await response.json().catch(() => ({}))) as Record<string, any>
  if (!response.ok) {
    const providerMessage = data?.error?.message ? `: ${String(data.error.message)}` : ''
    throw new Error(`WhatsApp template send failed (${response.status})${providerMessage}`)
  }
  const id = Array.isArray(data.messages) ? data.messages[0]?.id : null
  return typeof id === 'string' ? id : null
}
