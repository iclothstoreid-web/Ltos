import type { Metadata } from 'next'
import { DesignStudioClient } from '@/components/configurator/DesignStudioClient'

export const metadata: Metadata = {
  title: 'Design Studio | Local Tailor',
  description: 'Rangkai jubah bespoke Anda — pilih Model, Kerah, Manset, Material, dan Warna, lalu lihat estimasi harga secara langsung.',
}

// Sprint W2-1 foundation — public configurator, distinct from the internal
// Fitter-facing Design Studio at /workspace/design-studio (untouched by
// this sprint). Catalog data is fetched client-side from
// GET /api/design/options, which is the only thing that reads Master Data
// (via the integration layer, src/lib/configurator/mapping.ts).
export default function DesignStudioPage() {
  return <DesignStudioClient />
}
