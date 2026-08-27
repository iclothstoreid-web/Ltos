import type { Metadata } from 'next'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/public'
import { fetchPublishedJournalArticles } from '@/lib/content/journalArticles'
import { websiteMediaUrl, websiteMediaSrcSet } from '@/lib/content/mediaUrl'
import { buildSimplePageMetadata } from '@/lib/marketing/seo'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'
import { withLocaleAlternates } from '@/i18n/alternates'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { MaterialHero } from '@/components/fabric/MaterialHero'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { WalnutGrainOverlay } from '@/components/marketing/shell/WalnutGrainOverlay'

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleAlternates(
    buildSimplePageMetadata({
      title: 'Journal',
      description: 'Catatan tentang bahan, potongan, dan kerajinan di balik setiap thobe bespoke Local Tailor.',
      path: '/journal',
    }),
    FABRIC_SITE_ORIGIN,
    '/journal'
  )
}

const BREADCRUMB_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Journal', path: '/journal' },
]

// Sprint DS-UX Scope B — /journal is now DB-backed (Owner OS -> Content ->
// Articles). Published-only via the SECURITY DEFINER RPC. Revalidated on a
// 5-minute ISR window so a newly-published article appears without a deploy.
// The /knowledge cluster is untouched and stays hardcoded TS.
export const revalidate = 300

export default async function JournalPage() {
  const supabase = createPublicClient()
  const articles = await fetchPublishedJournalArticles(supabase).catch(() => [])

  return (
    <main className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      <JsonLd data={breadcrumbSchema(BREADCRUMB_ITEMS)} />
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs items={BREADCRUMB_ITEMS} />
        <MaterialHero
          eyebrow="Journal"
          title="Catatan dari Atelier"
          description="Cerita tentang bahan, konstruksi, dan detail yang membentuk setiap thobe bespoke."
        />

        {articles.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-luxury-sans text-sm text-luxury-taupe">
              Belum ada tulisan yang dipublikasikan. Sementara itu, lihat panduan ukuran kami.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <MagneticButton href="/cek-ukuran-thobe" variant="primary">Panduan Ukuran</MagneticButton>
              <MagneticButton href="/" variant="ghost">Kembali ke Beranda</MagneticButton>
            </div>
          </div>
        ) : (
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {articles.map((a) => {
              const src = websiteMediaUrl(a.cover_path, { width: 720, height: 480, quality: 70, resize: 'cover' })
              return (
                <li key={a.slug}>
                  <Link href={`/journal/${a.slug}`} className="group block">
                    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-sm bg-luxury-charcoal/40">
                      {src && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          srcSet={websiteMediaSrcSet(a.cover_path, { width: 720, height: 480, quality: 70, resize: 'cover' })}
                          sizes="(min-width: 640px) 45vw, 90vw"
                          alt={a.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <p className="mt-3 font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">
                      {a.category}
                    </p>
                    <h2 className="mt-1 font-fraunces text-xl leading-tight text-luxury-ivory group-hover:text-luxury-gold">
                      {a.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 font-luxury-sans text-sm text-luxury-taupe">{a.excerpt}</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <WalnutGrainOverlay />
    </main>
  )
}
