'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/lib/communication/messages'
import { SENDER_ROLE_LABELS } from '@/lib/communication/types'
import type { CommunicationMessage } from '@/lib/communication/types'

interface OrderCommunicationPanelProps {
  orderId: string
  profileId: string
  profileName: string
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

// Fitter's window into the same Communication Thread Owner OS reads
// (communication_messages, order-scoped) — same table, same rows, sent here
// via the plain authenticated table access (Fitter has a real Supabase
// session, same as Owner OS), not the kiosk RPC path Production Packet uses.
export function OrderCommunicationPanel({ orderId, profileId, profileName, initialMessages }: OrderCommunicationPanelProps) {
  const [supabase] = useState(() => createClient())
  const [messages, setMessages] = useState(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!body.trim()) return
    setSending(true)
    setError(null)
    try {
      const message = await sendMessage(supabase, {
        orderId,
        senderRole: 'fitter',
        senderName: profileName,
        createdBy: profileId,
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
    <div className="bg-white border-[0.5px] border-[#c4c7c7]/40 p-6">
      <p className="text-xs uppercase tracking-widest text-[#444748] mb-4">Komunikasi Pesanan</p>

      <div className="max-h-72 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-[#444748]">Belum ada komunikasi untuk order ini.</p>
        )}
        {messages.map(message => (
          <div key={message.id}>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-[10px] uppercase tracking-widest text-[#775a19]">
                {SENDER_ROLE_LABELS[message.sender_role]}
              </span>
              {message.sender_name && <span className="text-[11px] text-[#444748]">{message.sender_name}</span>}
              <span className="text-[11px] text-[#444748]/70">{formatTime(message.created_at)}</span>
            </div>
            <p className="text-sm text-[#151c27] bg-[#f9f9ff] px-3 py-2 whitespace-pre-wrap">{message.body}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-[#c0392b] mb-2">{error}</p>}

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
          placeholder="Tulis pesan sebagai Fitter..."
          rows={2}
          className="flex-1 border-b border-[#c4c7c7] bg-transparent py-2 text-sm outline-none resize-none focus:border-[#775a19] transition-colors"
        />
        <button
          type="button"
          disabled={sending || !body.trim()}
          onClick={handleSend}
          className="px-5 py-2 bg-[#151c27] text-white text-xs uppercase tracking-widest hover:bg-[#775a19] transition-colors disabled:opacity-40"
        >
          Kirim
        </button>
      </div>
    </div>
  )
}
