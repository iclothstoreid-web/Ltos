'use client'

import { useId, useState, type FormEvent } from 'react'
import { Reveal } from '@/components/marketing/shell/Reveal'
import { GoldAccentLine } from '@/components/marketing/placeholders/GoldAccentLine'
import { buildContentWhatsAppUrl } from '@/lib/content/whatsapp'
import { CITY_BUSINESS, type CityConfig } from '@/lib/seo/cityConfig'
import { appendUtmNote, type UtmParams } from '@/lib/seo/utm'

interface AppointmentFormProps {
  city: CityConfig
  utm?: UtmParams
}

const GARMENT_TYPES = ['Thobe', 'Baju Koko', 'Belum Yakin / Ingin Konsultasi Dulu'] as const

// Sprint W8-B §6 — Appointment Generation Layer. A pure client-side form:
// no backend endpoint, no database write (this project's own rules say
// "prefer existing RPCs" and don't add new schema for a one-off form) —
// submitting composes a WhatsApp message from the filled fields and opens
// wa.me with it, the same "form-to-WhatsApp" pattern every other CTA on
// this site already uses, just with more structured input.
export function AppointmentForm({ city, utm }: AppointmentFormProps) {
  const nameId = useId()
  const cityId = useId()
  const garmentId = useId()
  const dateId = useId()

  const [name, setName] = useState('')
  const [customerCity, setCustomerCity] = useState(city.city)
  const [garmentType, setGarmentType] = useState<string>(GARMENT_TYPES[0])
  const [eventDate, setEventDate] = useState('')

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const lines = [
      'Halo Tarda, saya ingin membuat appointment:',
      `Nama: ${name || '-'}`,
      `Kota: ${customerCity || '-'}`,
      `Jenis Pakaian: ${garmentType}`,
      eventDate ? `Tanggal Acara: ${eventDate}` : null,
    ].filter((line): line is string => line !== null)

    const message = appendUtmNote(lines.join('\n'), utm ?? {})
    const whatsappUrl = buildContentWhatsAppUrl(CITY_BUSINESS.whatsappInternational, message)
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section aria-labelledby="appointment-form-heading" className="bg-luxury-navy px-6 py-24 md:px-10">
      <div className="mx-auto max-w-xl">
        <Reveal className="text-center">
          <GoldAccentLine className="mx-auto mb-4" />
          <p className="font-luxury-sans text-xs uppercase tracking-[0.2em] text-luxury-gold">Appointment</p>
          <h2 id="appointment-form-heading" className="mt-3 font-fraunces text-3xl text-luxury-ivory md:text-4xl">
            Buat Appointment untuk {city.city}
          </h2>
          <p className="mt-4 font-luxury-sans text-sm text-luxury-taupe">
            Isi detail singkat berikut — kami akan lanjutkan konsultasi via WhatsApp.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label htmlFor={nameId} className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold">
                Nama
              </label>
              <input
                id={nameId}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-sm border border-luxury-gold/[0.18] bg-luxury-charcoal/40 px-4 py-3 font-luxury-sans text-sm text-luxury-ivory outline-none focus:border-luxury-gold/60"
              />
            </div>

            <div>
              <label htmlFor={cityId} className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold">
                Kota
              </label>
              <input
                id={cityId}
                type="text"
                required
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
                className="mt-2 w-full rounded-sm border border-luxury-gold/[0.18] bg-luxury-charcoal/40 px-4 py-3 font-luxury-sans text-sm text-luxury-ivory outline-none focus:border-luxury-gold/60"
              />
            </div>

            <div>
              <label htmlFor={garmentId} className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold">
                Jenis Pakaian
              </label>
              <select
                id={garmentId}
                value={garmentType}
                onChange={(e) => setGarmentType(e.target.value)}
                className="mt-2 w-full rounded-sm border border-luxury-gold/[0.18] bg-luxury-charcoal/40 px-4 py-3 font-luxury-sans text-sm text-luxury-ivory outline-none focus:border-luxury-gold/60"
              >
                {GARMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={dateId} className="font-luxury-sans text-xs uppercase tracking-[0.1em] text-luxury-gold">
                Tanggal Acara <span className="normal-case text-luxury-taupe">(opsional)</span>
              </label>
              <input
                id={dateId}
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-2 w-full rounded-sm border border-luxury-gold/[0.18] bg-luxury-charcoal/40 px-4 py-3 font-luxury-sans text-sm text-luxury-ivory outline-none focus:border-luxury-gold/60"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-luxury-gold px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-black transition hover:brightness-110"
            >
              Lanjutkan via WhatsApp
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
