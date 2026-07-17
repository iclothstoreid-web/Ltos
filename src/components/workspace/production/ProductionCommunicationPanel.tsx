'use client'

import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Operator } from '@/lib/production/types'
import { sendOrderCommunication } from '@/lib/communication/kiosk'
import { SENDER_ROLE_LABELS } from '@/lib/communication/types'
import type { CommunicationMessage } from '@/lib/communication/types'
import { OperatorAutocomplete } from './OperatorAutocomplete'

interface ProductionCommunicationPanelProps {
  supabase: SupabaseClient
  orderId: string
  initialMessages: CommunicationMessage[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Kiosk (no-login) window into the exact same Communication Thread Owner OS
// and Fitter read — communication_messages, order-scoped, unfiltered by
// stage. Goes through the get/send_order_communication RPCs (see
// lib/communication/kiosk.ts) instead of direct table access since this
// page has no auth.uid(). Identity here is independent of whichever
// operator is mid-stage below — any operator on the floor can open this and
// check/send messages regardless of who's actively working the current
// stage.
export function ProductionCommunicationPanel({ supabase, orderId, initialMessages }: ProductionCommunicationPanelProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [composerOperator, setComposerOperator] = useState<Operator | null>(null)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!body.trim() || !composerOperator) return
    setSending(true)
    setError(null)
    try {
      const message = await sendOrderCommunication(supabase, {
        orderId,
        senderRole: 'production',
        senderName: composerOperator.nama,
        body,
      })
      setMessages(prev => [...prev, message])
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim pesan.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white/70 rounded-2xl border-[0.5px] border-[#c6c6cc]/40 shadow-sm p-6">
      <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] mb-4">
        Komunikasi Order
      </p>

      <div className="max-h-64 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <p className="font-hanken text-sm text-[#46464c]">Belum ada komunikasi untuk order ini.</p>
        )}
        {messages.map(message => (
          <div key={message.id}>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="font-hanken text-[10px] uppercase tracking-widest text-[#755b00]">
                {SENDER_ROLE_LABELS[message.sender_role]}
              </span>
              {message.sender_name && (
                <span className="font-hanken text-[11px] text-[#46464c]">{message.sender_name}</span>
              )}
              <span className="font-hanken text-[11px] text-[#46464c]/70">{formatTime(message.created_at)}</span>
            </div>
            <p className="font-hanken text-sm text-[#161b29] bg-[#FDFCF7] rounded-xl px-3 py-2 whitespace-pre-wrap">
              {message.body}
            </p>
          </div>
        ))}
      </div>

      {error && <p className="font-hanken text-xs text-red-600 mb-2">{error}</p>}

      <div className="space-y-3">
        <OperatorAutocomplete
          supabase={supabase}
          value={composerOperator}
          onChange={setComposerOperator}
          onReset={() => setComposerOperator(null)}
        />
        <div className="flex items-end gap-3">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={composerOperator ? 'Tulis pesan...' : 'Pilih nama operator dahulu...'}
            rows={2}
            disabled={!composerOperator}
            className="flex-1 border-b border-[#c6c6cc] bg-transparent py-2 font-hanken text-sm text-[#161b29]
                       outline-none resize-none focus:border-[#755b00] transition-colors disabled:opacity-40"
          />
          <button
            type="button"
            disabled={sending || !body.trim() || !composerOperator}
            onClick={handleSend}
            className="px-5 py-2 bg-[#161b29] text-white font-hanken text-xs uppercase tracking-widest
                       hover:bg-[#755b00] transition-colors disabled:opacity-40"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  )
}
