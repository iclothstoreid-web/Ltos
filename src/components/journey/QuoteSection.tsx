import { SectionShell } from './SectionShell'
import { SectionEyebrow } from './SectionEyebrow'

const DEFAULT_MESSAGE =
  'Terima kasih telah mempercayakan pembuatan pakaian Anda kepada Local Tailor. Seluruh ' +
  'detail pesanan Anda telah kami konfirmasi dan siap memasuki proses pembuatan.'

interface QuoteSectionProps {
  message?: string
  label?: string
  variant?: 'editorial' | 'closing'
}

// Merges what used to be two near-identical components — EditorialMessageSection
// (eyebrow label + italic quote, e.g. "Tentang Proses Kami" / "Komitmen Kami" /
// "Pesan Artisan") and ClosingMessageSection (italic quote + "Local Tailor"
// signature, e.g. Milestone 1's default close and every milestone's own
// closing note) — both were the same "centered italic quote in a bordered
// section" shape, differing only in the chrome around the quote. `variant`
// picks which chrome renders; content still comes entirely from props.
export function QuoteSection({ message = DEFAULT_MESSAGE, label, variant = 'closing' }: QuoteSectionProps) {
  const isClosing = variant === 'closing'

  return (
    <SectionShell spacing="lg" centered>
      {label && <SectionEyebrow>{label}</SectionEyebrow>}
      <p className={`font-fraunces text-lg italic text-on-surface leading-relaxed ${isClosing ? 'mb-8' : ''}`}>
        &ldquo;{message}&rdquo;
      </p>
      {isClosing && (
        <p className="font-sans text-[10px] uppercase tracking-widest text-secondary/60">Local Tailor</p>
      )}
    </SectionShell>
  )
}
