import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'

const CAPABILITIES = [
  'Memilih model thobe',
  'Memilih warna',
  'Memilih kerah',
  'Memilih manset',
  'Melihat kombinasi desain secara real-time',
  'Konsultasi langsung dengan tim kami',
] as const

// Sprint Y §Y-1 — "Apa itu Design Studio?" section.
export function WhatIsDesignStudio() {
  return (
    <section aria-labelledby="what-is-design-studio-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Apa Itu Design Studio?</p>
          <h2 id="what-is-design-studio-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Titik Awal Setiap Pesanan Bespoke, Bukan Katalog Produk Jadi
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-luxury-sans text-sm text-luxury-taupe">
            Design Studio adalah konfigurator Digital Bespoke Tailoring kami — tempat Anda menentukan kombinasi desain
            sebelum pola personal dibentuk. Di Design Studio, Anda dapat:
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
            {CAPABILITIES.map((capability) => (
              <li key={capability} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-[10px] h-px w-4 flex-shrink-0 bg-luxury-gold" />
                <span className="font-luxury-sans text-sm text-luxury-taupe">{capability}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
