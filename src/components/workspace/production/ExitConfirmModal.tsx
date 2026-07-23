'use client'

import { useRouter } from 'next/navigation'

interface ExitConfirmModalProps {
  open: boolean
  onCancel: () => void
}

// Custom confirm dialog for the Android back-button trap (see
// useProductionBackGuard) — deliberately not the native confirm() so it
// matches the kiosk's own visual language and exact two-button wording.
export function ExitConfirmModal({ open, onCancel }: ExitConfirmModalProps) {
  const router = useRouter()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-6">
      <div className="bg-white max-w-sm w-full p-6 rounded-sm">
        <p className="font-hanken text-lg text-[#161b29] mb-2">Yakin bade kaluar ti dieu?</p>
        <p className="font-hanken text-sm text-[#46464c] mb-6">
          Sadaya progress anu acan disimpen tiasa leungit.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 font-hanken text-sm font-semibold uppercase tracking-widest
                       border border-[#161b29] text-[#161b29] hover:bg-[#161b29]/5 transition-colors"
          >
            Teu Wios
          </button>
          <button
            type="button"
            onClick={() => router.replace('/production')}
            className="flex-1 py-3 font-hanken text-sm font-semibold uppercase tracking-widest
                       bg-[#161b29] text-white hover:bg-[#755b00] transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  )
}
