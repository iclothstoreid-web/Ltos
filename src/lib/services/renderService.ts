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
export async function renderDesign(context: RenderContext): Promise<RenderResult> {
  try {
    const payload = mapContextToPayload(context)

    const response = await fetch('/api/design/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data: RenderServiceResponse = await response.json()

    if (!response.ok || !data.success) {
      return {
        status: 'error',
        error: data.error || 'Render failed',
      }
    }

    return {
      status: 'success',
      imageUrl: data.renderedImageUrl ?? undefined,
      // totalTokens lives nested under promptCompression (compressPrompt()'s
      // own output), not as a top-level field on the API response.
      tokenUsage: {
        total: data.promptCompression?.totalTokens,
      },
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
