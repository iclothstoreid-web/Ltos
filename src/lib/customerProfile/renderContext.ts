import type { CustomerDigitalProfile } from './types'
import type { DesignSpecification } from '@/lib/designSpecification/types'

// NOT a permanent object — unlike CustomerDigitalProfile, a RenderContext is
// never persisted anywhere. It only ever exists transiently, assembled the
// moment a customer/fitter presses "Generate Preview" in the (not yet built)
// Design Studio, and handed straight to the AI Render Engine.
export interface RenderContext {
  customerDigitalProfile: CustomerDigitalProfile
  designSpecification: DesignSpecification | null
}

// Render Context Builder: pure assembler, no AI call, no API route, no
// prompt. Just shapes the two inputs the future AI Render Engine will need
// into one object, built on demand — never stored.
export function buildRenderContext(
  customerDigitalProfile: CustomerDigitalProfile,
  designSpecification: DesignSpecification | null = null
): RenderContext {
  return { customerDigitalProfile, designSpecification }
}

export interface RenderContextValidation {
  ready: boolean
  missing: string[]
}

// The pilihan that must be resolved (non-null option ref) before a
// RenderContext is considered complete — Bordir/Handmade Zig-Zag are
// decorative add-ons, so they're deliberately not required here.
const REQUIRED_SPEC_FIELDS: Array<{ key: keyof DesignSpecification; label: string }> = [
  { key: 'model', label: 'Model' },
  { key: 'lookCutting', label: 'Cutting' },
  { key: 'fabric', label: 'Fabric' },
  { key: 'color', label: 'Color' },
  { key: 'collar', label: 'Collar' },
  { key: 'cuff', label: 'Cuff' },
  { key: 'plaket', label: 'Plaket' },
  { key: 'pocket', label: 'Pocket' },
  { key: 'button', label: 'Button' },
]

// Single source of truth for "is this consultation ready for a Render
// Context" — used by Design Studio's Generate Final Preview button before
// it calls buildRenderContext. Returns every reason it isn't ready, not
// just the first, so the UI can show one clear, complete message.
export function validateRenderContextReadiness(
  customerDigitalProfile: CustomerDigitalProfile | null,
  designSpecification: DesignSpecification | null
): RenderContextValidation {
  const missing: string[] = []

  if (!customerDigitalProfile) {
    missing.push('Customer Digital Profile belum tersedia — selesaikan Measurement terlebih dahulu.')
  }

  if (!designSpecification) {
    missing.push('Design Specification belum tersedia.')
  } else {
    REQUIRED_SPEC_FIELDS.forEach(({ key, label }) => {
      if (!designSpecification[key]) missing.push(`${label} belum dipilih.`)
    })
  }

  return { ready: missing.length === 0, missing }
}
