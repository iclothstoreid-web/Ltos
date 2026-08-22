import BrandLogo, { type LogoVariant } from './BrandLogo'

interface LogoProps {
  /**
   * - horizontal: official navbar lockup.
   * - horizontalTagline: footer/hero lockup.
   * - vertical: stacked variant.
   * - mark: icon-only variant.
   */
  variant: LogoVariant
  className?: string
  title?: string
}

export type { LogoVariant }

export function Logo({ variant, className, title }: LogoProps) {
  return <BrandLogo variant={variant} className={className} alt={title} />
}
