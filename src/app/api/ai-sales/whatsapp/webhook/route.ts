import { NextRequest } from 'next/server'
import {
  GET as handleWhatsAppVerification,
  POST as handleWhatsAppInbound,
} from '@/app/api/webhooks/whatsapp/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return handleWhatsAppVerification(request)
}

export async function POST(request: NextRequest) {
  return handleWhatsAppInbound(request)
}
