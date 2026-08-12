import { footerCopy, navCopy } from '@/lib/marketing/copy'

export function Footer() {
  return (
    <footer className="border-t border-luxury-gold/[0.14] bg-luxury-navy-deep px-6 py-16 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <p className="font-fraunces text-xl text-luxury-ivory">{navCopy.brand}</p>
          <p className="mt-1 font-luxury-sans text-[10px] font-light uppercase tracking-[0.2em] text-luxury-taupe">
            {navCopy.brandSuffix}
          </p>
          <p className="mt-3 max-w-xs font-luxury-sans text-sm text-luxury-taupe">{footerCopy.tagline}</p>
        </div>

        {footerCopy.columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">{column.title}</p>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="font-luxury-sans text-sm text-luxury-taupe hover:text-luxury-ivory">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p className="mx-auto mt-16 max-w-7xl font-luxury-sans text-xs text-luxury-taupe">{footerCopy.legal}</p>
    </footer>
  )
}
