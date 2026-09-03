import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bot, ChevronLeft, MessageCircle, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { sendAiSalesHumanReply, setAiSalesMode } from './actions'

export const metadata: Metadata = {
  title: 'AI Sales | Owner OS',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

function formatTime(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

const STAGE_LABEL: Record<string, string> = {
  new: 'NEW',
  qualified: 'QUALIFIED',
  offer: 'OFFER',
  hot: 'HOT',
  dp: 'DP',
  order: 'ORDER',
  lost: 'LOST',
}

export default async function AiSalesInboxPage({
  searchParams,
}: {
  searchParams?: { conversation?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('name, role').eq('id', user.id).single()
  if (!profile || !['admin', 'owner'].includes(profile.role)) redirect('/owner')

  const { data: conversations, error: conversationsError } = await supabase
    .from('ai_sales_conversations')
    .select('id, external_contact_id, customer_name, customer_phone, stage, mode, handoff_reason, context, last_inbound_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (conversationsError) throw conversationsError

  const selectedId = searchParams?.conversation || conversations?.[0]?.id || null
  const selected = conversations?.find(item => item.id === selectedId) ?? null

  const [{ data: messages }, { data: actions }] = selectedId
    ? await Promise.all([
        supabase
          .from('ai_sales_messages')
          .select('id, direction, role, text_content, message_type, created_at, delivery_status')
          .eq('conversation_id', selectedId)
          .order('created_at', { ascending: true })
          .limit(200),
        supabase
          .from('ai_sales_actions')
          .select('id, action_type, status, payload, created_at')
          .eq('conversation_id', selectedId)
          .order('created_at', { ascending: false })
          .limit(20),
      ])
    : [{ data: [] }, { data: [] }]

  const orderIntent = actions?.find(action => action.action_type === 'order_intent')?.payload ?? null
  const context = selected?.context && typeof selected.context === 'object' ? selected.context : {}
  const lead = context && 'lead' in context && typeof context.lead === 'object' ? context.lead : null

  return (
    <main className="min-h-screen bg-[#F5F2EC] text-slate-900">
      <header className="border-b border-black/10 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/owner" className="rounded-lg p-2 hover:bg-black/5" aria-label="Kembali ke Owner OS">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold">AI Sales Inbox</h1>
              <p className="text-sm text-slate-500">WhatsApp → AI → Closing → Order Intent LTOS</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>{profile.name || 'Owner'}</div>
            <div>{conversations?.length ?? 0} percakapan</div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-0 lg:grid-cols-[330px_minmax(0,1fr)_340px]">
        <aside className="min-h-[calc(100vh-73px)] border-r border-black/10 bg-white">
          <div className="border-b border-black/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Leads
          </div>
          <div className="divide-y divide-black/5">
            {(conversations ?? []).map(item => {
              const active = item.id === selectedId
              return (
                <Link
                  key={item.id}
                  href={`/owner/ai-sales?conversation=${item.id}`}
                  className={`block px-4 py-4 transition ${active ? 'bg-[#EFE8DB]' : 'hover:bg-black/[0.025]'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{item.customer_name || item.customer_phone || item.external_contact_id}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{item.external_contact_id}</div>
                    </div>
                    <span className="rounded-full border border-black/10 bg-white px-2 py-1 text-[10px] font-semibold">
                      {STAGE_LABEL[item.stage] || item.stage}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      {item.mode === 'ai' ? <Bot className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
                      {item.mode === 'ai' ? 'AI aktif' : 'Human'}
                    </span>
                    <span>{formatTime(item.last_inbound_at)}</span>
                  </div>
                </Link>
              )
            })}
            {!conversations?.length && (
              <div className="px-5 py-10 text-center text-sm text-slate-500">Belum ada percakapan WhatsApp.</div>
            )}
          </div>
        </aside>

        <section className="flex min-h-[calc(100vh-73px)] flex-col">
          {selected ? (
            <>
              <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-white px-5 py-4">
                <div>
                  <div className="font-semibold">{selected.customer_name || selected.customer_phone || selected.external_contact_id}</div>
                  <div className="text-xs text-slate-500">+{selected.external_contact_id}</div>
                </div>
                <form action={setAiSalesMode}>
                  <input type="hidden" name="conversationId" value={selected.id} />
                  <input type="hidden" name="mode" value={selected.mode === 'ai' ? 'human' : 'ai'} />
                  <button
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      selected.mode === 'ai' ? 'bg-slate-900 text-white' : 'border border-black/15 bg-white text-slate-800'
                    }`}
                  >
                    {selected.mode === 'ai' ? 'Ambil Alih' : 'Aktifkan AI'}
                  </button>
                </form>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-6">
                {(messages ?? []).map(message => {
                  const inbound = message.direction === 'inbound'
                  return (
                    <div key={message.id} className={`flex ${inbound ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          inbound ? 'rounded-bl-md bg-white' : 'rounded-br-md bg-[#163B32] text-white'
                        }`}
                      >
                        <div className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${inbound ? 'text-slate-400' : 'text-white/60'}`}>
                          {message.role === 'human' ? 'OWNER' : message.role === 'assistant' ? 'AI' : 'CUSTOMER'}
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.text_content || `[${message.message_type}]`}
                        </div>
                        <div className={`mt-2 text-[10px] ${inbound ? 'text-slate-400' : 'text-white/50'}`}>
                          {formatTime(message.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-black/10 bg-white p-4">
                {selected.mode === 'human' ? (
                  <form action={sendAiSalesHumanReply} className="flex gap-3">
                    <input type="hidden" name="conversationId" value={selected.id} />
                    <textarea
                      name="text"
                      required
                      rows={2}
                      maxLength={3000}
                      placeholder="Balas sebagai Local Tailor..."
                      className="min-h-[52px] flex-1 resize-none rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    />
                    <button className="self-end rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Kirim</button>
                  </form>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2 text-sm text-slate-500">
                    <Bot className="h-4 w-4" /> AI sedang menangani percakapan ini. Ambil alih untuk membalas manual.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
              <MessageCircle className="mr-2 h-5 w-5" /> Pilih percakapan untuk membuka chat.
            </div>
          )}
        </section>

        <aside className="min-h-[calc(100vh-73px)] border-l border-black/10 bg-white p-5">
          <h2 className="text-sm font-semibold">Sales Context</h2>
          {selected ? (
            <div className="mt-4 space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Stage</div>
                  <div className="mt-1 font-semibold">{STAGE_LABEL[selected.stage] || selected.stage}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Handler</div>
                  <div className="mt-1 font-semibold">{selected.mode === 'ai' ? 'AI' : 'Human'}</div>
                </div>
              </div>

              {selected.handoff_reason && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Handoff</div>
                  <div className="mt-1 rounded-lg bg-amber-50 p-3 text-amber-900">{selected.handoff_reason}</div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lead yang sudah terbaca</div>
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs leading-relaxed">
                  {lead ? JSON.stringify(lead, null, 2) : 'Belum ada data terstruktur.'}
                </pre>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order Intent</div>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs leading-relaxed">
                  {orderIntent ? JSON.stringify(orderIntent, null, 2) : 'Customer belum commit order.'}
                </pre>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Data lead akan muncul di sini.</p>
          )}
        </aside>
      </div>
    </main>
  )
}
