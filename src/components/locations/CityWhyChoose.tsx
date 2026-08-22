import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import type { CityConfig } from '@/lib/seo/cityConfig'

interface CityWhyChooseProps {
  city: CityConfig
}

// Sprint W8-2/3 — "Mengapa Memilih Tarda {City}". New component (not
// a W8-1 rename): distinct from LocalTrustSection's numeric trust bar —
// this is a reasons-to-choose-us list. Reasons are the same real,
// already-established facts used sitewide (personal pattern per customer,
// Digital Body Profile retention, quality control, made-to-order — see
// src/lib/marketing/copy.ts's trustBadgesCopy/authorityCopy for the
// original claims), not new unverified claims invented per city.
const REASONS = [
  { title: 'Pola Personal, Bukan Template', description: 'Setiap garmen diformulasikan dari pengukuran tubuh Anda sendiri, bukan disesuaikan dari pola standar.' },
  { title: 'Digital Body Profile Tersimpan', description: 'Ukuran Anda tersimpan untuk pemesanan berikutnya — tidak perlu diukur ulang dari nol.' },
  { title: 'Quality Control Sebelum Dikirim', description: 'Setiap garmen diperiksa jahitan, ukuran, dan finishing sebelum meninggalkan workshop.' },
  { title: 'Made-to-Order, Bukan Massal', description: 'Produksi dimulai setelah pesanan Anda dikonfirmasi, bukan diproduksi lebih dulu sebagai stok.' },
] as const

export function CityWhyChoose({ city }: CityWhyChooseProps) {
  return (
    <section aria-labelledby="city-why-choose-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Mengapa Memilih Kami</p>
          <h2 id="city-why-choose-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Mengapa Memilih Tarda {city.city}
          </h2>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, i) => (
            <Reveal as="li" key={reason.title} delay={i * 0.08}>
              <article className="h-full rounded-sm border border-luxury-gold/[0.10] bg-luxury-charcoal/40 p-6">
                <h3 className="font-fraunces text-lg text-luxury-ivory">{reason.title}</h3>
                <p className="mt-2 font-luxury-sans text-xs leading-relaxed text-luxury-taupe">{reason.description}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
