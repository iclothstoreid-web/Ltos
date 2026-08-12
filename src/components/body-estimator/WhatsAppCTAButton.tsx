'use client'

import { buildWhatsAppBookingMessage, buildWhatsAppBookingUrl, buildWhatsAppInquiryMessage } from '@/lib/body-estimator/whatsapp'
import type { EstimatorInput, EstimatorResult } from '@/lib/body-estimator/types'

interface WhatsAppCTAButtonProps {
  input: EstimatorInput
  result: EstimatorResult
  leadName?: string
  className?: string
  variant?: 'primary' | 'secondary'
}

// TODO_PLACEHOLDER_ENV — set NEXT_PUBLIC_WHATSAPP_NUMBER in the deployment
// env (see .env.example). Falls back to a clearly-fake placeholder number
// so the button still works end-to-end in dev/preview.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890'

// Analytics stubs (brief §"Analytics Stub") — no provider wired yet. Fired
// for both variants: both are booking-intent WhatsApp CTAs, brief only
// defines these two event names, not a separate one per variant.
function bookingCtaClick() {
  if (process.env.NODE_ENV !== 'production') console.debug('[analytics stub] booking_cta_click')
}
function whatsappBookingClick() {
  if (process.env.NODE_ENV !== 'production') console.debug('[analytics stub] whatsapp_booking_click')
}

const VARIANT_STYLES: Record<'primary' | 'secondary', string> = {
  primary:
    'bg-luxury-gold text-luxury-black hover:brightness-110 hover:shadow-[0_0_24px_rgba(200,162,74,0.45)]',
  secondary:
    'border border-luxury-gold/40 text-luxury-ivory hover:border-luxury-gold hover:text-luxury-gold',
}

// Sprint W0.4 — "Book Free Measurement" (primary, full booking profile
// attached) and "Chat WhatsApp Tailor" (secondary, a lighter general
// inquiry — no data attached). Both open WhatsApp with or without a lead
// name (soft gate — LeadCaptureForm is optional, not a blocker). `w-full
// sm:w-auto` satisfies "WhatsApp button harus full width" on mobile.
export function WhatsAppCTAButton({ input, result, leadName, className = '', variant = 'primary' }: WhatsAppCTAButtonProps) {
  const message =
    variant === 'primary'
      ? buildWhatsAppBookingMessage({
          name: leadName,
          height: input.height,
          weight: input.weight,
          age: input.age,
          bodyProfile: result.bodyProfile,
          fit: result.fit,
          size: result.size,
          confidence: result.confidence,
        })
      : buildWhatsAppInquiryMessage()
  const href = buildWhatsAppBookingUrl(WHATSAPP_NUMBER, message)

  function handleClick() {
    bookingCtaClick()
    whatsappBookingClick()
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex w-full items-center justify-center rounded-full px-8 py-4 font-luxury-sans text-sm uppercase tracking-[0.14em] transition duration-300 focus-visible:ring-2 focus-visible:ring-luxury-gold/50 sm:w-auto ${VARIANT_STYLES[variant]} ${className}`}
    >
      {variant === 'primary' ? 'Book Free Measurement' : 'Chat WhatsApp Tailor'}
    </a>
  )
}
