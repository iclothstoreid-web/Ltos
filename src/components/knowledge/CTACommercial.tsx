import Link from 'next/link'

interface CTACommercialProps {
  label: string
  href: string
}

// National SEO (P0-3 / Task 14) — forward link from a Knowledge cluster to
// its commercial "money page" (a Revenue Landing Page or a national
// pillar). Same plain server <Link> as the other Knowledge CTAs — no
// client boundary. Route + label come from src/lib/knowledge/cta.ts's
// per-category config, so only high-relevance clusters carry one and it is
// set in exactly one place, never per-article.
export function CTACommercial({ label, href }: CTACommercialProps) {
  return (
    <Link
      href={href}
      className="inline-flex w-full items-center justify-center rounded-full border border-luxury-gold/60 px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-gold transition duration-300 hover:bg-luxury-gold hover:text-luxury-black sm:w-auto"
    >
      {label}
    </Link>
  )
}
