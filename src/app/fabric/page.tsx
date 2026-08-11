import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { getAllMaterials, getMaterialCategories } from '@/lib/materials/materialRepository'
import { buildFabricExplorerMetadata } from '@/lib/materials/seo'
import { MaterialHero } from '@/components/fabric/MaterialHero'
import { MaterialGrid } from '@/components/fabric/MaterialGrid'
import { CategoryChip } from '@/components/fabric/CategoryChip'

export const metadata: Metadata = buildFabricExplorerMetadata()

// Revalidated hourly rather than fully static — the catalog is expected to
// grow via the (future) Material Master admin UI without a redeploy.
export const revalidate = 3600

export default async function FabricExplorerPage() {
  const supabase = createPublicClient()
  const [materials, categories] = await Promise.all([
    getAllMaterials(supabase),
    getMaterialCategories(supabase),
  ])

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <MaterialHero
          title="Fabric Explorer"
          description="Jelajahi koleksi material bespoke kami — komposisi, tekstur, dan karakteristik setiap kain."
        >
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <CategoryChip key={category} category={category} />
              ))}
            </div>
          )}
        </MaterialHero>

        <div className="mt-10">
          <MaterialGrid materials={materials} />
        </div>
      </div>
    </div>
  )
}
