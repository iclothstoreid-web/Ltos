import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConfiguratorCatalog } from '@/lib/configurator/mapping'

// Public read-only catalog for the /design-studio configurator. Anonymous
// visitors are expected — this only ever returns fetchActiveMasterOptions'
// already-public-safe shape (see src/lib/configurator/mapping.ts), never
// ai_dna/render_recipe/internal_notes.
export async function GET() {
  const supabase = createClient()

  try {
    const catalog = await getConfiguratorCatalog(supabase)
    return NextResponse.json(catalog)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load configurator catalog.' },
      { status: 500 }
    )
  }
}
