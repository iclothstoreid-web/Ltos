import { NextRequest, NextResponse } from 'next/server'
import { processWhatsAppInbound } from '@/lib/ai-sales/service'
import {
  parseWhatsAppInboundMessages,
  verifyWhatsAppChallenge,
  verifyWhatsAppSignature,
} from '@/lib/ai-sales/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const challenge = verifyWhatsAppChallenge(request.nextUrl.searchParams)
    if (!challenge) return new NextResponse('Forbidden', { status: 403 })
    return new NextResponse(challenge, { status: 200 })
  } catch (error) {
    console.error('[ai-sales][whatsapp] verification error', error)
    return new NextResponse('Webhook not configured', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  try {
    const signature = request.headers.get('x-hub-signature-256')
    if (!verifyWhatsAppSignature(rawBody, signature)) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    const payload = JSON.parse(rawBody) as unknown
    const messages = parseWhatsAppInboundMessages(payload)

    // Process sequentially so multiple messages from the same customer in one
    // provider batch preserve their natural order. Provider-message idempotency
    // prevents duplicate AI calls if Meta retries this webhook delivery.
    for (const message of messages) {
      await processWhatsAppInbound(message)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    // Once a signed provider event reaches us, avoid a retry storm that could
    // repeatedly hit paid dependencies. The service records runtime/send
    // failures as AI Sales actions and switches the conversation to human mode.
    console.error('[ai-sales][whatsapp] processing error', error)
    return NextResponse.json({ received: true, processing_error: true })
  }
}
