import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEstimate } from '@/lib/configurator/estimate'
import { SERVICE_LEVELS } from '@/lib/configurator/eta'
import type { DesignConfig, ServiceLevel } from '@/types/configurator'

interface EstimateRequestBody {
  config?: DesignConfig
  serviceLevel?: ServiceLevel
}

// Thin by design — all pricing/ETA logic lives in
// src/lib/configurator/estimate.ts (which itself only reads Master Data
// through the mapping.ts integration layer, never a direct table query
// from here).
export async function POST(req: NextRequest) {
  let body: EstimateRequestBody
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

  const supabase = createClient()

  try {
    const estimate = await getEstimate(supabase, config, serviceLevel)
    return NextResponse.json(estimate)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to compute estimate.' },
      { status: 500 }
    )
  }
}
