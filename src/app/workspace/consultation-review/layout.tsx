import { Fraunces } from 'next/font/google'

// Fonts scoped to Consultation Review only — independent from Check-In/
// Measurement/Design Studio's own layouts (all frozen this sprint). Inter is
// already the global font-sans; Fraunces reuses the same CSS var name the
// existing additive tailwind.config `fraunces` key expects.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-fraunces',
})

export default function ConsultationReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} contents`}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      {children}
    </div>
  )
}
