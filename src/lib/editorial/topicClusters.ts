import type { KnowledgeCategorySlug } from '@/lib/knowledge/types'

// Sprint W6-9 — Topic cluster definitions. A "cluster" here is the
// editorial unit above a category: one pillar article that should hold
// the most inbound links and broadest keyword coverage, plus the
// supporting articles that link up to it. This mirrors the standard
// hub-and-spoke SEO content model, applied to the real KNOWLEDGE_CATEGORIES
// taxonomy rather than a parallel one.

export interface TopicCluster {
  category: KnowledgeCategorySlug
  clusterName: string
  pillarSlug: string
  supportingSlugs: string[]
}

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    category: 'fabrics',
    clusterName: 'Bahan Thobe',
    pillarSlug: 'premium-cotton',
    supportingSlugs: ['linen', 'japanese-cotton', 'egyptian-cotton', 'poplin', 'twill', 'oxford', 'wool-blend', 'rayon', 'premium-polyester'],
  },
  {
    category: 'measurements',
    clusterName: 'Pengukuran Thobe',
    pillarSlug: 'how-to-measure-body',
    supportingSlugs: ['chest', 'shoulder', 'sleeve', 'length', 'neck', 'thobe-size-guide', 'slim-vs-regular-fit'],
  },
  {
    category: 'styling',
    clusterName: 'Gaya Thobe',
    pillarSlug: 'formal-thobe',
    supportingSlugs: ['navy-thobe', 'olive-thobe', 'black-thobe', 'white-thobe', 'casual-thobe', 'wedding-thobe-style', 'umrah-thobe-style'],
  },
  {
    category: 'wedding',
    clusterName: 'Thobe Pernikahan',
    pillarSlug: 'bespoke-wedding-guide',
    supportingSlugs: [
      'akad-pria',
      'resepsi-pria',
      'couple-muslim',
      'timeline-custom-wedding',
      'color-guide',
      'family-outfit',
      'premium-thobe-wedding',
    ],
  },
  {
    category: 'umrah',
    clusterName: 'Thobe Umrah',
    pillarSlug: 'best-fabric',
    supportingSlugs: ['how-many-thobes', 'color-guide', 'packing-guide', 'care-during-travel', 'climate-guide', 'premium-umrah-outfit', 'custom-umrah-thobe'],
  },
  {
    category: 'tailoring',
    clusterName: 'Proses Tailoring',
    pillarSlug: 'what-is-bespoke',
    supportingSlugs: [
      'bespoke-vs-made-to-measure',
      'pattern-drafting',
      'interlining-guide',
      'collar-construction',
      'sleeve-construction',
      'handmade-details',
      'quality-control',
    ],
  },
  {
    category: 'care',
    clusterName: 'Perawatan Thobe',
    pillarSlug: 'extend-garment-life',
    supportingSlugs: [
      'wash-linen',
      'iron-thobe',
      'store-premium-garments',
      'remove-wrinkles',
      'maintain-white-thobe',
      'wool-blend-care',
      'dry-clean-vs-hand-wash',
    ],
  },
  {
    // W6-10 — local authority cluster, same hub-and-spoke shape as the
    // other 7, pillar is the /knowledge/bogor hub-equivalent overview page.
    category: 'bogor',
    clusterName: 'Tarda Bogor',
    pillarSlug: 'custom-thobe',
    supportingSlugs: ['bespoke-tailor', 'wedding-tailor', 'umrah-thobe'],
  },
]

export function getClusterByCategory(category: KnowledgeCategorySlug): TopicCluster | undefined {
  return TOPIC_CLUSTERS.find((cluster) => cluster.category === category)
}
