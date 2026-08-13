import { Reveal } from '@/components/marketing/shell/Reveal'
import { MagneticButton } from '@/components/marketing/shell/MagneticButton'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'

// Sprint W8-1 — "Pricing" section. No price figures are shown — every
// garment is made-to-order and quoted per consultation, the same reasoning
// already documented in src/lib/materials/seo.ts's Product schema (no
// Material Master price is ever exposed publicly) and reused for the
// location pages' own LocalBusiness schema (no `priceRange` set). This
// section explains *why* honestly rather than fabricating a "starting
// from Rp X" figure this business can't guarantee across every fabric and
// design combination.
const PRICE_FACTORS = ['Pilihan material (katun, linen, wool blend, dan lainnya)', 'Detail konstruksi dan finishing tangan', 'Kompleksitas desain (kerah, manset, aksesori)']

export function LocationPricing() {
  return (
    <section aria-labelledby="location-pricing-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Harga</p>
          <h2 id="location-pricing-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Harga Ditentukan Saat Konsultasi, Bukan dari Daftar Harga Tetap
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-luxury-sans text-sm text-luxury-taupe">
            Karena setiap garmen dibuat sesuai pesanan (made-to-order), harga akhir tergantung pada:
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mx-auto mt-6 max-w-md space-y-3 text-left">
            {PRICE_FACTORS.map((factor) => (
              <li key={factor} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-[10px] h-px w-4 flex-shrink-0 bg-luxury-gold" />
                <span className="font-luxury-sans text-sm text-luxury-taupe">{factor}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15} className="mt-10">
          <MagneticButton href="/design-studio" variant="primary">
            Lihat Estimasi Langsung di Design Studio
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
