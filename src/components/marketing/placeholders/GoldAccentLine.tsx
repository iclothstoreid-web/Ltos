export function GoldAccentLine({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-px w-12 bg-gradient-to-r from-luxury-gold to-transparent ${className}`}
    />
  )
}
