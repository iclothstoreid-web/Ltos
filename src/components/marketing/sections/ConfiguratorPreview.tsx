'use client'

import { useState } from 'react'
import Image from 'next/image'
import { configuratorCopy, fabricCopy } from '@/lib/marketing/copy'
import { measurementMannequinSrc } from '@/lib/marketing/assets'
import { Reveal } from '../shell/Reveal'
import { MagneticButton } from '../shell/MagneticButton'
import { GoldAccentLine } from '../placeholders/GoldAccentLine'
import { LuxuryGradientField } from '../placeholders/LuxuryGradientField'
import { LinenTexture } from '../placeholders/LinenTexture'

const COLORS = [
  { name: 'Ivory', hex: '#F3EDE6' },
  { name: 'Charcoal', hex: '#1B1714' },
  { name: 'Bronze', hex: '#B9923F' },
  { name: 'Linen', hex: '#E8E1D3' },
]

// Illustrative preview only — mirrors the shape of the real Design Studio
// (fabric + color selection, live price/time readout), not wired to the
// live pricing engine. "Continue Designing" hands off to the real flow.
export function ConfiguratorPreview() {
  const [fabricIndex, setFabricIndex] = useState(0)
  const [colorIndex, setColorIndex] = useState(0)
  const fabric = fabricCopy.cards[fabricIndex]

  return (
    <section id="configurator" aria-labelledby="configurator-heading" className="bg-luxury-navy-deep px-6 py-24 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
          <LuxuryGradientField variant="b" />
          <LinenTexture opacity={0.15} />
          {/* The mannequin itself is the real, neutral Design Studio asset —
              it doesn't recolor. The selected color instead reads as an
              ambient studio-light tint behind it, which is closer to how
              the real fitting session actually presents fabric color. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40 blur-2xl transition-colors duration-500"
            style={{ backgroundColor: COLORS[colorIndex].hex }}
          />
          <div className="relative h-full w-full">
            <Image
              src={measurementMannequinSrc}
              alt={configuratorCopy.mannequinAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-8"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <GoldAccentLine className="mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">{configuratorCopy.eyebrow}</p>
          <h2 id="configurator-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            {configuratorCopy.heading}
          </h2>
          <p className="mt-4 max-w-md font-luxury-sans text-sm text-luxury-taupe">{configuratorCopy.body}</p>

          <div className="mt-8">
            <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">{configuratorCopy.fabricLabel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fabricCopy.cards.map((card, i) => (
                <button
                  key={card.name}
                  type="button"
                  onClick={() => setFabricIndex(i)}
                  className={`cursor-pointer rounded-full border px-4 py-2 font-luxury-sans text-xs transition ${
                    i === fabricIndex
                      ? 'border-luxury-gold text-luxury-gold'
                      : 'border-luxury-gold/[0.14] text-luxury-taupe hover:border-luxury-gold/30'
                  }`}
                >
                  {card.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">{configuratorCopy.colorLabel}</p>
            <div className="mt-3 flex gap-3">
              {COLORS.map((color, i) => (
                <button
                  key={color.name}
                  type="button"
                  aria-label={color.name}
                  onClick={() => setColorIndex(i)}
                  className={`h-8 w-8 cursor-pointer rounded-full border-2 transition ${
                    i === colorIndex ? 'border-luxury-gold' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-luxury-gold/[0.14] pt-6">
            <div>
              <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">{configuratorCopy.priceLabel}</p>
              <p className="mt-1 font-fraunces text-xl text-luxury-ivory">{fabric.name}</p>
              <p className="font-luxury-sans text-xs text-luxury-taupe">{fabric.origin}</p>
            </div>
            <div>
              <p className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-gold">{configuratorCopy.timeLabel}</p>
              <p className="mt-1 font-fraunces text-xl text-luxury-ivory">2–3 weeks</p>
              <p className="font-luxury-sans text-xs text-luxury-taupe">{fabric.trait}</p>
            </div>
          </div>

          <MagneticButton href="/design-studio" variant="primary" className="mt-8">
            {configuratorCopy.cta}
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  )
}
