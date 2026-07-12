import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LTOS — Local Tailor Operating System',
  description: 'Vertical Business Operating System for premium custom tailoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-surface text-on-surface antialiased`}>
        {children}
      </body>
    </html>
  )
}
