import Link from 'next/link'

interface ArticleBreadcrumbNavProps {
  currentLabel: string
}

// Sprint W0.5 — visible breadcrumb, kept in sync 1:1 with each page's own
// buildArticleBreadcrumbSchema() call (same convention as Fabric Explorer's
// hand-rolled breadcrumb nav — no shared schema+UI component exists there
// either, each page owns both from the same data).
export function ArticleBreadcrumbNav({ currentLabel }: ArticleBreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto mb-8 max-w-3xl">
      <ol className="flex flex-wrap items-center gap-2 font-luxury-sans text-xs text-luxury-taupe">
        <li>
          <Link href="/" className="transition-colors hover:text-luxury-gold">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-luxury-ivory">
          {currentLabel}
        </li>
      </ol>
    </nav>
  )
}
