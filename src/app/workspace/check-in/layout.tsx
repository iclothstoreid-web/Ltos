import { Fraunces, Libre_Caslon_Text } from 'next/font/google'

// Fonts scoped to the Check-In workspace only — the root layout and its
// `font-sans`/`font-serif` tokens used by every other page are untouched.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-fraunces',
})
const caslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-caslon',
})

export default function CheckInLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${caslon.variable} contents`}>
      {/*
        Material Symbols Outlined has no next/font/google entry (icon fonts
        aren't in that catalog), so it's the one unavoidable manual <link>.
      */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      {children}
    </div>
  )
}
