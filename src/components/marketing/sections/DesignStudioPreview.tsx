import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { ExperienceCards } from '@/components/design-studio/ExperienceCards'
import { DIGITAL_BESPOKE_EXPERIENCES } from '@/lib/design-studio/experienceCopy'

// Sprint Y §Y-2 — Homepage Integration. Reuses the exact same
// DIGITAL_BESPOKE_EXPERIENCES data and ExperienceCards component the
// /design-studio pillar page renders, so the homepage teaser and the full
// page can never say something different about what Video Call Fitting,
// Home Visit, or Showroom Experience actually include.
export function DesignStudioPreview() {
  return (
    <section id="digital-bespoke-tailoring" aria-labelledby="design-studio-preview-heading" className="bg-luxury-navy px-6 pt-24 md:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Design Studio — Bespoke dari Mana Saja</p>
          <h2 id="design-studio-preview-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Bespoke Tailoring Tanpa Batas Jarak
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-luxury-sans text-sm text-luxury-taupe">
            Rancang thobe Anda dari mana saja melalui video call, Design Studio, dan layanan home visit — pengalaman
            yang sama seperti berada langsung di showroom Tarda.
          </p>
        </Reveal>
      </div>

      <ExperienceCards heading="Tiga Cara Menggunakan Design Studio" items={DIGITAL_BESPOKE_EXPERIENCES} />

      <div className="mx-auto max-w-3xl pb-24 text-center">
        <Reveal>
          <MagneticButton href="/design-studio" variant="primary">
            Explore Design Studio
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
