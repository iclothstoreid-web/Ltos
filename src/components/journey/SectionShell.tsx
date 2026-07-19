import type { ReactNode } from 'react'

interface SectionShellProps {
  children: ReactNode
  spacing?: 'md' | 'lg'
  centered?: boolean
  divider?: boolean
  className?: string
}

const SPACING_CLASS: Record<'md' | 'lg', string> = {
  md: 'py-8',
  lg: 'py-10',
}

// Single source of truth for the Journey "section shell" — every body
// section below the hero shares this same px-6/max-w-2xl wrapper (most with
// a top divider); only vertical spacing and text alignment vary between
// sections. Previously this exact Tailwind string was copy-pasted into every
// section component individually.
export function SectionShell({
  children,
  spacing = 'md',
  centered = false,
  divider = true,
  className = '',
}: SectionShellProps) {
  const classes = [
    'px-6',
    SPACING_CLASS[spacing],
    'max-w-2xl mx-auto',
    divider && 'border-t border-[#151c27]/10',
    centered && 'text-center',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <section className={classes}>{children}</section>
}
