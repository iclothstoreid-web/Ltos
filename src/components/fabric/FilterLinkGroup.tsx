import Link from 'next/link'

export interface FilterLinkOption {
  value: string
  label: string
  href: string
  active: boolean
}

interface FilterLinkGroupProps {
  title: string
  options: FilterLinkOption[]
}

// One facet's option list — every option is a real <Link> (built by
// src/lib/materials/searchParamsHelpers.ts), so selecting a filter is a
// normal navigation, keyboard-operable and screen-reader-navigable with no
// extra JS. `aria-current="true"` marks the active option instead of a
// purely visual cue.
export function FilterLinkGroup({ title, options }: FilterLinkGroupProps) {
  if (options.length === 0) return null

  return (
    <fieldset className="border-t border-luxury-gold/10 pt-4 first:border-t-0 first:pt-0">
      <legend className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-taupe">{title}</legend>
      <ul className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <li key={option.value}>
            <Link
              href={option.href}
              aria-current={option.active ? 'true' : undefined}
              className={`inline-flex items-center rounded-full border px-3 py-1 font-luxury-sans text-xs transition focus-visible:ring-2 focus-visible:ring-luxury-gold/50 ${
                option.active
                  ? 'border-luxury-gold bg-luxury-gold text-luxury-black'
                  : 'border-luxury-gold/20 text-luxury-ivory hover:border-luxury-gold/60'
              }`}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
