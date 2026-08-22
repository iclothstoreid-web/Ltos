'use client'

import Link from 'next/link'
import {
  buildArticleBookingMessage,
  buildArticleInquiryMessage,
  buildContentWhatsAppUrl,
  CONTENT_WHATSAPP_NUMBER,
} from '@/lib/content/whatsapp'

interface ArticleConversionCTAsProps {
  articleTitle: string
}

// Analytics stub, scoped to the content cluster — same console.debug-only
// pattern as the estimator's stubs, not wired to a provider, and doesn't
// touch W0.4's own analytics functions.
function articleCtaClick(cta: 'estimator' | 'booking' | 'inquiry') {
  if (process.env.NODE_ENV !== 'production') console.debug('[analytics stub] article_cta_click', cta)
}

// Sprint W0.5 §"Conversion Layer" — three distinct CTAs per article:
// estimator (drives to the actual tool), Book Free Measurement (WhatsApp,
// clear booking intent), and a lighter WhatsApp chat (general question).
// No profile data attached to either WhatsApp link — this is a guide page,
// not a result page (see src/lib/body-estimator/whatsapp.ts for the one
// that does attach a real EstimatorResult).
export function ArticleConversionCTAs({ articleTitle }: ArticleConversionCTAsProps) {
  const bookingUrl = buildContentWhatsAppUrl(CONTENT_WHATSAPP_NUMBER, buildArticleBookingMessage(articleTitle))
  const inquiryUrl = buildContentWhatsAppUrl(CONTENT_WHATSAPP_NUMBER, buildArticleInquiryMessage(articleTitle))

  return (
    <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-luxury-gold/25 bg-luxury-charcoal/30 p-6 text-center md:p-10">
      <p className="font-luxury-sans text-[10px] uppercase tracking-[0.14em] text-luxury-gold">Langkah Selanjutnya</p>
      <h2 className="mt-3 font-fraunces text-2xl text-luxury-ivory md:text-3xl">
        Cek Ukuran Anda, Lalu Booking Pengukuran Gratis
      </h2>
      <p className="mx-auto mt-3 max-w-lg font-luxury-sans text-sm text-luxury-taupe">
        Mulai dari estimasi online, lalu lanjutkan ke pengukuran langsung oleh fitter Tarda untuk Digital Body
        Profile yang terverifikasi.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/free-body-profile-estimator"
          onClick={() => articleCtaClick('estimator')}
          className="inline-flex w-full items-center justify-center rounded-full bg-luxury-gold px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-black transition duration-300 hover:brightness-110 hover:shadow-[0_0_24px_rgba(200,162,74,0.45)] sm:w-auto"
        >
          Cek Ukuran Gratis
        </Link>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => articleCtaClick('booking')}
          className="inline-flex w-full items-center justify-center rounded-full border border-luxury-gold/40 px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-ivory transition hover:border-luxury-gold hover:text-luxury-gold sm:w-auto"
        >
          Book Free Measurement
        </a>
        <a
          href={inquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => articleCtaClick('inquiry')}
          className="inline-flex w-full items-center justify-center font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe underline-offset-4 transition-colors hover:text-luxury-gold hover:underline sm:w-auto"
        >
          Chat WhatsApp Tailor
        </a>
      </div>
    </div>
  )
}
