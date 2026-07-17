'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/lib/communication/messages'
import { SENDER_ROLE_LABELS } from '@/lib/communication/types'
import type { CommunicationMessage } from '@/lib/communication/types'

interface CommunicationThreadProps {
  orderId: string
  orderLabel: string
  messages: CommunicationMessage[]
  profileId: string
  profileName: string
  onMessageSent: (message: CommunicationMessage) => void
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// One thread view, reused by both the Per Order and Per Stage modes in
// CommunicationsCenter — neither mode renders its own copy of a message
// list, per the brief's "jangan menduplikasi pesan" rule.
export function CommunicationThread({ orderId, orderLabel, messages, profileId, profileName, onMessageSent }: CommunicationThreadProps) {
  const supabase = createClient()
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const thread = messages.filter(m => m.order_id === orderId)

  async function handleSend() {
    if (!body.trim()) return
    setSending(true)
    setError(null)
    try {
      const message = await sendMessage(supabase, {
        orderId,
        senderRole: 'owner',
        senderName: profileName,
        createdBy: profileId,
        body,
      })
      onMessageSent(message)
      setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim pesan.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-outline-variant/80">
        <p className="text-label text-secondary uppercase tracking-widest">Komunikasi Order</p>
        <p className="text-title text-on-surface mt-1">{orderLabel}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {thread.length === 0 && (
          <p className="text-body text-secondary">Belum ada komunikasi untuk order ini.</p>
        )}
        {thread.map(message => (
          <div key={message.id} className="max-w-[80%]">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-label uppercase tracking-widest text-primary">
                {SENDER_ROLE_LABELS[message.sender_role]}
              </span>
              {message.sender_name && (
                <span className="text-label text-secondary">{message.sender_name}</span>
              )}
              <span className="text-label text-secondary/70">{formatTime(message.created_at)}</span>
            </div>
            <p className="text-body text-on-surface bg-surface-container rounded-[14px] px-4 py-3 whitespace-pre-wrap">
              {message.body}
            </p>
          </div>
        ))}
      </div>

      {error && <p className="px-6 text-label text-error mb-2">{error}</p>}

      <div className="px-6 py-4 border-t border-outline-variant/80 flex items-end gap-3">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Tulis pesan sebagai Owner..."
          rows={2}
          className="flex-1 bg-transparent border border-outline-variant/90 rounded-[14px] px-4 py-2.5 text-body text-on-surface placeholder:text-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
        />
        <button
          type="button"
          disabled={sending || !body.trim()}
          onClick={handleSend}
          className="p-3 rounded-[9999px] bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-40"
          aria-label="Kirim pesan"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
