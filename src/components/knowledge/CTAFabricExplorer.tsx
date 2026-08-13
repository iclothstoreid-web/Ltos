import Link from 'next/link'

interface CTAFabricExplorerProps {
  label?: string
}

export function CTAFabricExplorer({ label = 'Jelajahi Fabric Explorer' }: CTAFabricExplorerProps = {}) {
  return (
    <Link
      href="/fabric"
      className="inline-flex w-full items-center justify-center rounded-full border border-luxury-gold/40 px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory transition hover:border-luxury-gold hover:text-luxury-gold sm:w-auto"
    >
      {label}
    </Link>
  )
}
