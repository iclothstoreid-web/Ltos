/**
 * Render Service — orchestrate design rendering
 *
 * Architecture:
 * RenderContext → mapContextToPayload() → /api/design/render → RenderResult
 *
 * Single responsibility:
 * - Convert RenderContext to API payload (using getCategoryByDesignField helper)
 * - Execute fetch to /api/design/render
 * - Transform response to RenderResult
 *
 * Does NOT:
 * - Know business logic of components (kerah, saku, plaket, etc)
 * - Define or duplicate mappings
 * - Handle UI state (parent handles that)
 *
 * Dependencies:
 * - getCategoryByDesignField from masterData (single source of truth)
 */

import type { RenderContext } from '@/lib/customerProfile/renderContext'
import type { RenderResult, RenderPayload, RenderServiceResponse } from '@/lib/types/render'
import { getCategoryByDesignField } from '@/lib/design/masterData'

/**
 * Map RenderContext → API Payload
 *
 * Uses getCategoryByDesignField() helper (single source of truth from masterData.ts)
 * to convert design specification field names to repository category names.
 *
 * Zero business logic hardcoding — everything driven by repository metadata.
 */
function mapContextToPayload(context: RenderContext): RenderPayload {
  const { designSpecification, customerDigitalProfile } = context

  // Guard: designSpecification must not be null
  if (!designSpecification) {
    throw new Error('DesignSpecification is required for rendering')
  }

  const componentSelections = Object.entries(designSpecification)
    .filter(([field, optionRef]) => {
      // Only include fields that have:
      // 1. A non-null option reference
      // 2. A mapping in repository
      return (
        optionRef !== null &&
        typeof optionRef === 'object' &&
        'id' in optionRef &&
        getCategoryByDesignField(field) !== null
      )
    })
    .map(([field, optionRef]) => {
      const categoryType = getCategoryByDesignField(field)
      // Type guard: optionRef is guaranteed non-null by filter above
      const ref = optionRef as { id: string }
      return {
        componentType: categoryType!,
        componentId: ref.id,
      }
    })

  // Guard: customer photo must be available
  if (!customerDigitalProfile.customerPhoto) {
    throw new Error('Customer photo is required for rendering')
  }

  return {
    customerPhotoUrl: customerDigitalProfile.customerPhoto.url,
    componentSelections,
  }
}

/**
 * Execute render via /api/design/render
 *
 * Input: RenderContext (single source of truth)
 * Output: RenderResult (minimal, scalable)
 *
 * Flow:
 * 1. Map context to payload (using repository mappings)
 * 2. Fetch /api/design/render
 * 3. Handle response or error
 * 4. Return RenderResult for UI consumption
 */
export async function renderDesign(
  context: RenderContext,
  // Sprint O (Render Session) — consultationId lets the API scope its
  // Render Request Lock / Render History to this consultation. Optional
  // param (not part of RenderContext itself) so the design/business object
  // this function has always taken stays exactly as it was.
  meta?: { consultationId?: string },
): Promise<RenderResult> {
  try {
    const payload = mapContextToPayload(context)
    if (meta?.consultationId) payload.consultationId = meta.consultationId

    const response = await fetch('/api/design/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data: RenderServiceResponse = await response.json()

    if (!response.ok || !data.success) {
      // 409 = Render Request Lock rejection (Task 1) — a render for this
      // consultation is already in flight; surfaced as a normal error so
      // AIPreviewPanel's existing error banner shows it, no new UI state.
      const lockedNote = response.status === 409 && data.activeRenderId ? ` (render aktif: ${data.activeRenderId})` : ''
      return {
        status: 'error',
        error: (data.error || 'Render failed') + lockedNote,
        renderId: data.renderId,
      }
    }

    return {
      status: 'success',
      imageUrl: data.renderedImageUrl ?? undefined,
      // Sprint PR-04 — token total now lives top-level (promptTotalTokens),
      // not nested under the old fixed-bucket promptCompression object.
      tokenUsage: {
        total: data.promptTotalTokens,
      },
      renderId: data.renderId,
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
