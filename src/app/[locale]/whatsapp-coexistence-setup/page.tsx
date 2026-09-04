'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void
      login: (
        callback: (response: { authResponse?: { code?: string }; status?: string }) => void,
        options: Record<string, unknown>
      ) => void
    }
    fbAsyncInit?: () => void
  }
}

const APP_ID = '1608994384229587'
const CONFIG_ID = '1822339008751268'\nconst OAUTH_URL = `https://www.facebook.com/v26.0/dialog/oauth?client_id=${APP_ID}&config_id=${CONFIG_ID}&response_type=code&override_default_response_type=true&redirect_uri=${encodeURIComponent('https://localtailor.id/whatsapp-coexistence-setup')}&extras=${encodeURIComponent(JSON.stringify({ setup: {}, featureType: 'whatsapp_business_app_onboarding', sessionInfoVersion: '3' }))}`

type SignupResult = {
  event?: string
  data?: {
    waba_id?: string
    phone_number_id?: string
    business_id?: string
  }
}

export default function WhatsAppCoexistenceSetupPage() {
  const [sdkReady, setSdkReady] = useState(false)
  const [status, setStatus] = useState('Memuat koneksi Meta…')
  const [result, setResult] = useState<SignupResult | null>(null)

  useEffect(() => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v26.0',
      })
      setSdkReady(true)
      setStatus('Siap menghubungkan nomor WhatsApp Business App.')
    }

    const receiveMessage = (event: MessageEvent) => {
      if (!['https://www.facebook.com', 'https://web.facebook.com'].includes(event.origin)) return

      let payload: unknown = event.data
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch {
          return
        }
      }

      if (!payload || typeof payload !== 'object' || !('type' in payload) || payload.type !== 'WA_EMBEDDED_SIGNUP') return

      const signup = payload as SignupResult & { type: string }
      setResult(signup)

      if (signup.event === 'FINISH' || signup.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') {
        setStatus('Coexistence berhasil dihubungkan. WhatsApp Business App tetap aktif.')
      } else if (signup.event === 'CANCEL') {
        setStatus('Proses dibatalkan sebelum selesai.')
      } else if (signup.event === 'ERROR') {
        setStatus('Meta mengembalikan error. Periksa detail pada jendela onboarding.')
      }
    }

    window.addEventListener('message', receiveMessage)
    return () => window.removeEventListener('message', receiveMessage)
  }, [])

  const launchSignup = () => {
    if (!window.FB) {
      setStatus('Membuka otorisasi Meta…')
      window.location.assign(OAUTH_URL)
      return
    }

    setStatus('Membuka onboarding coexistence…')
    window.FB.login(
      response => {
        if (response.authResponse?.code) {
          setStatus(current =>
            current.includes('berhasil') ? current : 'Otorisasi selesai. Selesaikan seluruh langkah di jendela Meta.'
          )
        } else if (response.status) {
          setStatus(`Status Meta: ${response.status}`)
        }
      },
      {
        config_id: CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: 'whatsapp_business_app_onboarding',
          sessionInfoVersion: '3',
        },
      }
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F2EC] px-5 text-slate-900">
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => window.fbAsyncInit?.()}
      />
      <div id="fb-root" />
      <section className="w-full max-w-xl rounded-3xl border border-black/10 bg-white p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#78654B]">Local Tailor</p>
        <h1 className="mt-3 text-3xl font-semibold">Aktifkan WhatsApp Coexistence</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Hubungkan Cloud API tanpa memindahkan atau menonaktifkan nomor di WhatsApp Business App.
        </p>

        <div className="mt-6 rounded-2xl bg-[#F5F2EC] p-4 text-sm leading-6">
          <strong>Status:</strong> {status}
        </div>

        <button
          type="button"
          onClick={launchSignup}
          disabled={!sdkReady}
          className="mt-6 w-full rounded-xl bg-[#163B32] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sdkReady ? 'Hubungkan WhatsApp Business App' : 'Menyiapkan Meta…'}
        </button>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Pilih bisnis Local Tailor dan nomor +62 821-3000-325. Jika WhatsApp meminta QR atau persetujuan di ponsel,
          selesaikan langsung melalui WhatsApp Business App.
        </p>

        {result?.data && (
          <dl className="mt-6 grid gap-2 rounded-2xl border border-black/10 p-4 text-xs">
            <div className="flex justify-between gap-4"><dt>WABA</dt><dd>{result.data.waba_id || '—'}</dd></div>
            <div className="flex justify-between gap-4"><dt>Phone ID</dt><dd>{result.data.phone_number_id || '—'}</dd></div>
          </dl>
        )}
      </section>
    </main>
  )
}
