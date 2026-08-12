import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { getAllMaterials } from '@/lib/materials/materialRepository'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { FABRIC_CATEGORIES } from '@/types/material'
import { ALL_ARTICLES } from '@/lib/content/articles'

// Sprint W3-5 §11 — first sitemap this project has had. Deliberately
// scoped to the public Fabric Explorer + homepage, matching this sprint's
// stated scope ("Pastikan sitemap memasukkan: /fabric ... setiap material
// detail. Hanya material published.") rather than enumerating the entire
// site (staff/internal routes are correctly excluded — see robots.ts).
// getAllMaterials() already only returns published rows (the RPC behind
// it filters published=true), so "hanya material published" is satisfied
// by construction, not a separate filter here.
//
// Sprint W0.5 — added the estimator (previously missing from the sitemap
// entirely, despite being a real indexable page since W0.1) and the 4
// SEO content-cluster articles.
//
// Sprint W4.5 — added /design-studio (real since W2, never in the sitemap
// either) and the 3 new navigation placeholders (/gallery, /journal,
// /book-appointment).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient()
  const materials = await getAllMaterials(supabase)

  const staticEntries: MetadataRoute.Sitemap = [
    { url: FABRIC_SITE_ORIGIN, changeFrequency: 'weekly', priority: 1 },
    { url: `${FABRIC_SITE_ORIGIN}/design-studio`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${FABRIC_SITE_ORIGIN}/fabric`, changeFrequency: 'daily', priority: 0.9 },
    ...FABRIC_CATEGORIES.map((category) => ({
      url: `${FABRIC_SITE_ORIGIN}/fabric/${category}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    { url: `${FABRIC_SITE_ORIGIN}/free-body-profile-estimator`, changeFrequency: 'weekly', priority: 0.9 },
    ...ALL_ARTICLES.map((article) => ({
      url: `${FABRIC_SITE_ORIGIN}/${article.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${FABRIC_SITE_ORIGIN}/book-appointment`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${FABRIC_SITE_ORIGIN}/gallery`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${FABRIC_SITE_ORIGIN}/journal`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const materialEntries: MetadataRoute.Sitemap = materials.map((material) => ({
    url: `${FABRIC_SITE_ORIGIN}/fabric/${material.category}/${material.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticEntries, ...materialEntries]
}
