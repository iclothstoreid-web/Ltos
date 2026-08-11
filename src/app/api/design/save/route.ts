import { NextRequest, NextResponse } from 'next/server'
import { encodeDesignSession } from '@/lib/configurator/session'
import { SERVICE_LEVELS } from '@/lib/configurator/eta'
import type { DesignConfig, ServiceLevel } from '@/types/configurator'

interface LeadPayload {
  nama?: string
  email?: string
  whatsapp?: string
}

interface SaveRequestBody {
  config?: DesignConfig
  serviceLevel?: ServiceLevel
  lead?: LeadPayload
}

// Real as of W2-4 — no DB write ("Jangan mengubah database schema, jangan
// membuat migration baru"). The design itself is saved by being encoded
// into the returned shareUrl's slug (see session.ts); nothing to persist,
// nothing to look up. The optional lead payload has no durable store this
// sprint ("Untuk sprint ini cukup: local validation, analytics event,
// payload ikut tersimpan. Belum perlu CRM.") — it's accepted, sanity-
// checked, and logged server-side; the client additionally keeps its own
// copy via localStorage (see session.ts's ENGINE SEAM note for where a
// real design_sessions/leads table would plug in later).
export async function POST(req: NextRequest) {
  let body: SaveRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const config = body.config
  if (!config) {
    return NextResponse.json({ error: 'Missing config.' }, { status: 400 })
  }

  const serviceLevel = SERVICE_LEVELS.includes(body.serviceLevel as ServiceLevel)
    ? (body.serviceLevel as ServiceLevel)
    : 'standard'

  const slug = encodeDesignSession({ config, serviceLevel, createdAt: new Date().toISOString() })

  if (body.lead?.nama || body.lead?.email) {
    // eslint-disable-next-line no-console
    console.info('[design/save] lead captured (not persisted to DB this sprint)', {
      nama: body.lead?.nama,
      email: body.lead?.email,
      hasWhatsapp: !!body.lead?.whatsapp,
      designId: slug,
    })
  }

  return NextResponse.json({
    designId: slug,
    shareUrl: `${req.nextUrl.origin}/design/${slug}`,
  })
}
