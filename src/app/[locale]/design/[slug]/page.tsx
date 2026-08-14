import { cache } from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { decodeDesignSession } from '@/lib/configurator/session'
import { getConfiguratorCatalog, findOption } from '@/lib/configurator/mapping'
import { computeEstimate } from '@/lib/configurator/estimate'
import {
  DESIGN_BRAND_NAME,
  buildDesignTitle,
  buildDesignDescription,
  buildDesignMetadata,
  buildDesignProductSchema,
  buildDesignBreadcrumbSchema,
} from '@/lib/configurator/seo'
import { DesignSharePreview } from '@/components/design-share/DesignSharePreview'
import { DesignShareSummary } from '@/components/design-share/DesignShareSummary'
import { ShareMenu } from '@/components/design-share/ShareMenu'
import { ConsultationCta } from '@/components/design-share/ConsultationCta'

interface PageParams {
  params: { slug: string }
}

function getOrigin(): string {
  const h = headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

// Per-request memoized so generateMetadata() and the page body resolve the
// same slug exactly once. Uses computeEstimate() (the pure function) with
// an already-fetched catalog instead of getEstimate() (which fetches its
// own) — same locked pricing/ETA engine, just avoiding a redundant
// Supabase round trip since the catalog is already in hand for the
// preview/metadata anyway.
const resolveDesignShare = cache(async (slug: string) => {
  const session = decodeDesignSession(slug)
  if (!session) return null

  const supabase = createClient()
  const catalog = await getConfiguratorCatalog(supabase)
  const estimate = computeEstimate(session.config, session.serviceLevel, catalog)

  const selection = {
    model: findOption(catalog.fields.modelId, session.config.modelId),
    collar: findOption(catalog.fields.collarId, session.config.collarId),
    cuff: findOption(catalog.fields.cuffId, session.config.cuffId),
    fabric: findOption(catalog.fields.fabricId, session.config.fabricId),
    color: findOption(catalog.fields.colorId, session.config.colorId),
    embroidery: findOption(catalog.fields.embroidery, session.config.embroidery),
  }
  const accessories = session.config.accessories
    .map((id) => findOption(catalog.accessories, id))
    .filter((o): o is NonNullable<typeof o> => !!o)

  return { session, estimate, selection, accessories }
})

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const data = await resolveDesignShare(params.slug)
  if (!data) {
    return { title: `Desain Tidak Ditemukan | ${DESIGN_BRAND_NAME}` }
  }

  const url = `${getOrigin()}/design/${params.slug}`
  const title = buildDesignTitle(data.selection)
  const description = buildDesignDescription(data.selection, data.estimate)
  return buildDesignMetadata({ title, description, url })
}

// Server Component — config, service level, estimate, and completion date
// are all resolved before this ever reaches the client, so there is no
// client-side fetch and no loading/flash state to manage (unlike
// /design-studio, which fetches its catalog client-side). Read-only: no
// Zustand store, no store hydration — restoring the interactive
// configurator session is out of scope for this sprint.
export default async function DesignSharePage({ params }: PageParams) {
  const data = await resolveDesignShare(params.slug)
  if (!data) notFound()

  const origin = getOrigin()
  const url = `${origin}/design/${params.slug}`
  const title = buildDesignTitle(data.selection)
  const description = buildDesignDescription(data.selection, data.estimate)
  const productSchema = buildDesignProductSchema({ title, description, url, estimate: data.estimate })
  const breadcrumbSchema = buildDesignBreadcrumbSchema({ origin, title, url })

  return (
    <div className="min-h-screen bg-luxury-navy-deep px-6 py-10 md:py-16">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="mx-auto max-w-3xl">
        <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">
          <a href="/design-studio" className="hover:text-luxury-gold">
            Design Studio
          </a>{' '}
          / Desain Tersimpan
        </p>
        <h1 className="mt-2 font-luxury-sans text-lg text-luxury-ivory">{title}</h1>
        <p className="mt-1 font-luxury-sans text-xs text-luxury-taupe">{description}</p>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="flex items-center justify-center rounded-2xl border border-luxury-gold/10 bg-luxury-charcoal/20 py-10">
            <DesignSharePreview
              model={data.selection.model}
              collar={data.selection.collar}
              cuff={data.selection.cuff}
              embroidery={data.selection.embroidery}
              accessories={data.accessories}
            />
          </div>

          <div className="space-y-6">
            <DesignShareSummary estimate={data.estimate} />

            <div className="rounded-2xl border border-luxury-gold/15 bg-luxury-charcoal/40 p-6">
              <h3 className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-ivory">Bagikan Desain Ini</h3>
              <div className="mt-4">
                <ShareMenu designId={params.slug} url={url} title={title} />
              </div>
              <ConsultationCta
                designId={params.slug}
                className="mt-3 block w-full cursor-pointer rounded-full bg-luxury-gold py-2.5 text-center font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-black transition hover:brightness-110"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
