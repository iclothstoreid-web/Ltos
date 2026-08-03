// Seeds the 3 default Look Cutting Master Data options (Slim/Standard/
// Regular Fit). The Look Cutting engine itself — LOOK_CUTTING_FIT_LOCK_RULES
// / LOOK_CUTTING_FIT_NEGATIVE_RULES auto-attach, prompt builder consumption —
// already exists (see src/lib/design/aiDna/types.ts, masterData.ts's
// createMasterDataOption); this script only populates the catalog, through
// the exact same createMasterDataOption/updateMasterDataOption flow the
// Master Data Editor UI uses. No raw INSERT/UPDATE SQL, no new migration.
//
// createMasterDataOption has no parameter for ai_dna.referenceInstruction
// (by design — DEFAULT_AI_DESIGN_DNA.referenceInstruction is always null on
// create), so each option is created first (which auto-attaches Look Cutting
// Fit Knowledge via createMasterDataOption's existing 'look_cutting' branch),
// then updated once via updateMasterDataOption to set referenceInstruction —
// same Safe Save path a human editing this in Master Data Editor would take.
//
// Idempotent: skips any name that already exists under 'look_cutting' rather
// than creating a duplicate. Safe to run more than once.
//
// Usage: SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npx tsx scripts/seed-look-cutting.ts

import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import {
  createMasterDataOption,
  updateMasterDataOption,
  fetchAllMasterOptions,
} from '../src/lib/design/masterData'

loadEnv({ path: '.env.local', quiet: true })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const EMAIL = process.env.SEED_ADMIN_EMAIL
const PASSWORD = process.env.SEED_ADMIN_PASSWORD

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}
if (!EMAIL || !PASSWORD) {
  console.error('Usage: SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npx tsx scripts/seed-look-cutting.ts')
  console.error('(design_master_options RLS requires an authenticated admin/owner/artisan session for INSERT/UPDATE.)')
  process.exit(1)
}

interface LookCuttingSeed {
  name: string
  price: number
  // Stored as this option's single Selling Point ("Poin Jual / Keunggulan")
  // — the existing architecture has no separate "description" field on
  // design_master_options; selling_points is the customer-facing short-text
  // slot SpecDetailModal.tsx already renders for exactly this purpose.
  description: string
  referenceInstruction: string
}

const LOOK_CUTTING_DEFAULTS: LookCuttingSeed[] = [
  {
    name: 'Slim Fit',
    price: 0,
    description: 'Modern close-fitting silhouette.',
    referenceInstruction:
      "Maintain minimal ease between the garment and the customer's body. " +
      'The garment should closely follow the natural body silhouette while remaining comfortable and physically realistic. ' +
      'Use subtle fabric tension with minimal excess volume.',
  },
  {
    name: 'Standard Fit',
    price: 0,
    description: 'Balanced everyday silhouette.',
    referenceInstruction:
      "Maintain moderate ease between the garment and the customer's body. " +
      'The garment should appear naturally comfortable with balanced fabric volume. ' +
      'Generate soft drape without appearing tight or oversized.',
  },
  {
    name: 'Regular Fit',
    price: 0,
    description: 'Relaxed traditional silhouette.',
    referenceInstruction:
      "Maintain generous ease between the garment and the customer's body. " +
      'Allow the garment to hang naturally with increased fabric volume while preserving realistic proportions. ' +
      'Generate relaxed drape without appearing oversized or exaggerated.',
  },
]

async function main() {
  const supabase = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)

  const { error: authError } = await supabase.auth.signInWithPassword({ email: EMAIL as string, password: PASSWORD as string })
  if (authError) {
    console.error(`Sign-in failed: ${authError.message}`)
    process.exit(1)
  }

  for (const seed of LOOK_CUTTING_DEFAULTS) {
    const before = await fetchAllMasterOptions(supabase)
    const existing = before.look_cutting.find(o => o.name === seed.name)

    if (existing) {
      console.log(`Skipped "${seed.name}" — already exists (id=${existing.id}).`)
      continue
    }

    await createMasterDataOption(supabase, {
      category: 'look_cutting',
      name: seed.name,
      price: seed.price,
    })

    const after = await fetchAllMasterOptions(supabase)
    const created = after.look_cutting.find(o => o.name === seed.name)
    if (!created) {
      throw new Error(`Created "${seed.name}" but could not read it back — aborting.`)
    }

    await updateMasterDataOption(supabase, created.id, {
      name: created.name,
      metadata: created.metadata,
      photo_url: created.photo_url,
      selling_points: [seed.description],
      internal_notes: created.internal_notes,
      price: created.price,
      currentAiDna: { ...created.ai_dna, referenceInstruction: seed.referenceInstruction },
      original: created,
    })

    console.log(`Created "${seed.name}" (id=${created.id}) with Reference Instruction + Fit Knowledge.`)
  }

  console.log('\nDone.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
