'use client'

import { useRouter } from 'next/navigation'

interface ComingSoonRuleProps {
  title: string
  description: string
}

// Placeholder for Business Rules sub-areas with no engine/config built yet.
// Exists so the hub never has a card that "klik lalu diam" — every card
// either opens a real manager or this explicit not-yet-available page.
export function ComingSoonRule({ title, description }: ComingSoonRuleProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">{title}</h1>
          <p className="text-xs text-[#444748]">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/owner/business-rules')}
          className="text-xs uppercase tracking-widest text-[#755b00] hover:underline"
        >
          Kembali
        </button>
      </header>

      <main className="px-4 sm:px-8 lg:px-16 py-16 max-w-2xl mx-auto text-center">
        <p className="font-hanken text-sm font-semibold mb-1">Belum tersedia</p>
        <p className="text-xs text-[#444748]">Konfigurasi untuk area ini belum dibangun.</p>
      </main>
    </div>
  )
}
