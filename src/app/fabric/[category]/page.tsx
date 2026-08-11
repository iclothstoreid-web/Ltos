import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { getMaterialsByCategory } from '@/lib/materials/materialRepository'
import { buildFabricCategoryMetadata } from '@/lib/materials/seo'
import { FABRIC_CATEGORIES, FABRIC_CATEGORY_LABELS, isFabricCategory } from '@/types/material'
import { MaterialHero } from '@/components/fabric/MaterialHero'
import { MaterialGrid } from '@/components/fabric/MaterialGrid'
import { CategoryChip } from '@/components/fabric/CategoryChip'

interface PageParams {
  params: { category: string }
}

// Fixed taxonomy (src/types/material.ts) — every category page is
// pre-rendered regardless of whether it has materials yet, so the nav
// never links to a build-time-missing route.
export function generateStaticParams() {
  return FABRIC_CATEGORIES.map((category) => ({ category }))
}

// Closed enum, exhaustively listed above — unlike [slug] (open-ended,
// grows as materials are added), no legitimate category can ever fall
// outside this set. false makes an invalid segment 404 at the router
// level with a real HTTP 404, instead of falling through to an on-demand
// render whose notFound() status Next's ISR fallback cache (observed:
// x-nextjs-cache HIT, 200) doesn't propagate correctly.
export const dynamicParams = false

export function generateMetadata({ params }: PageParams): Metadata {
  if (!isFabricCategory(params.category)) {
    return { title: 'Kategori Tidak Ditemukan | Local Tailor' }
  }
  return buildFabricCategoryMetadata(params.category)
}

export const revalidate = 3600

export default async function FabricCategoryPage({ params }: PageParams) {
  if (!isFabricCategory(params.category)) notFound()

  const supabase = createPublicClient()
  const materials = await getMaterialsByCategory(supabase, params.category)
  const label = FABRIC_CATEGORY_LABELS[params.category]

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">
          <a href="/fabric" className="hover:text-luxury-gold">
            Fabric Explorer
          </a>{' '}
          / {label}
        </p>

        <div className="mt-4">
          <MaterialHero
            eyebrow="Kategori"
            title={`${label} Fabrics`}
            description={`Koleksi material ${label} — komposisi, tekstur, dan karakteristik untuk bespoke thobe Anda.`}
          >
            <div className="flex flex-wrap gap-2">
              {FABRIC_CATEGORIES.map((category) => (
                <CategoryChip key={category} category={category} active={category === params.category} />
              ))}
            </div>
          </MaterialHero>
        </div>

        <div className="mt-10">
          <MaterialGrid materials={materials} emptyMessage={`Belum ada material ${label} tersedia.`} />
        </div>
      </div>
    </div>
  )
}
