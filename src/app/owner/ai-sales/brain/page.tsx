import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  Database,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { loadAiSalesKnowledge } from '@/lib/ai-sales/knowledge'
import {
  createBrainEntry,
  createTrainingExample,
  deleteBrainEntry,
  deleteTrainingExample,
  reviewAiSalesMessage,
  saveBusinessFact,
  toggleBrainEntry,
  toggleBusinessFact,
  toggleTrainingExample,
} from './actions'

export const metadata: Metadata = {
  title: 'AI Sales Brain | Owner OS',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const FIELD =
  'w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500'
const LABEL = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500'
const BUTTON = 'rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800'
const SECONDARY =
  'rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50'

const CATEGORY_LABEL: Record<string, string> = {
  identity: 'Identity',
  style: 'Gaya Balas',
  playbook: 'Playbook',
  closing: 'Closing',
  follow_up: 'Follow-up',
  objection: 'Objection',
  invoice: 'Invoice',
  after_sales: 'After-sales',
  guardrail: 'Guardrail',
}

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

export default async function AiSalesBrainPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile } = await supabase.from('profiles').select('name, role').eq('id', user.id).single()
  if (!profile || !['admin', 'owner'].includes(profile.role)) redirect('/owner')

  const [
    knowledge,
    factsResult,
    brainResult,
    examplesResult,
    messagesResult,
    reviewsResult,
    conversationCountResult,
  ] = await Promise.all([
    loadAiSalesKnowledge(supabase),
    supabase
      .from('ai_sales_business_facts')
      .select('id, fact_key, category, label, value, notes, is_active, updated_at')
      .order('category')
      .order('label'),
    supabase
      .from('ai_sales_brain_entries')
      .select('id, category, title, content, stage, tags, priority, source_type, source_ref, is_active, updated_at')
      .order('priority', { ascending: false })
      .limit(200),
    supabase
      .from('ai_sales_training_examples')
      .select('id, stage_before, stage_after, situation, customer_message, ideal_reply, rationale, outcome, priority, source_type, is_active, updated_at')
      .order('priority', { ascending: false })
      .limit(150),
    supabase
      .from('ai_sales_messages')
      .select('id, conversation_id, text_content, created_at, ai_sales_conversations(customer_name, external_contact_id)')
      .eq('direction', 'outbound')
      .eq('role', 'assistant')
      .not('text_content', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('ai_sales_message_reviews').select('message_id, verdict, corrected_reply, notes, updated_at'),
    supabase.from('ai_sales_conversations').select('*', { count: 'exact', head: true }),
  ])

  const queryError =
    factsResult.error ||
    brainResult.error ||
    examplesResult.error ||
    messagesResult.error ||
    reviewsResult.error ||
    conversationCountResult.error
  if (queryError) throw queryError

  const facts = factsResult.data ?? []
  const brainEntries = brainResult.data ?? []
  const examples = examplesResult.data ?? []
  const reviews = new Map((reviewsResult.data ?? []).map(review => [review.message_id, review]))
  const activeBrain = brainEntries.filter(item => item.is_active).length
  const activeExamples = examples.filter(item => item.is_active).length
  const autoReplyEnabled = process.env.WHATSAPP_AI_AUTOREPLY_ENABLED === 'true'

  return (
    <main className="min-h-screen bg-[#F5F2EC] text-slate-900">
      <header className="border-b border-black/10 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/owner/ai-sales" className="rounded-lg p-2 hover:bg-black/5" aria-label="Kembali ke AI Sales">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold">AI Sales Brain</h1>
              <p className="text-sm text-slate-500">Business truth + gaya sales + contoh nyata + review pembelajaran</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>{profile.name || 'Owner'}</div>
            <div>{autoReplyEnabled ? 'Auto-reply aktif' : 'Auto-reply OFF selama review Meta'}</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-8 px-5 py-8">
        <section
          className={`rounded-2xl border p-4 ${
            autoReplyEnabled ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5" />
            <div>
              <div className="font-semibold">
                {autoReplyEnabled ? 'WhatsApp AI Auto-reply aktif' : 'WhatsApp AI Auto-reply sedang dimatikan'}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                Brain tetap bisa dibangun dan diedit. Pesan WhatsApp tetap masuk ke LTOS, tetapi OpenAI tidak akan
                membalas otomatis sampai production diaktifkan kembali.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Live Business Facts', value: facts.filter(item => item.is_active).length, icon: Database },
            { label: 'Brain Aktif', value: activeBrain, icon: Brain },
            { label: 'Training Examples', value: activeExamples, icon: BookOpen },
            { label: 'Percakapan WhatsApp', value: conversationCountResult.count ?? 0, icon: MessageSquareText },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</div>
                  <Icon className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-3 text-3xl font-semibold">{stat.value}</div>
              </div>
            )
          })}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="border-b border-black/10 px-6 py-5">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <h2 className="text-lg font-semibold">1. Live Business Truth</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Fakta yang boleh dipakai AI sebagai kebenaran bisnis. Katalog kain ({knowledge.fabrics.length}), opsi
              desain ({knowledge.options.length}), dan aturan DP ({knowledge.commercialRules.minDpPercent ?? '—'}%)
              tetap dibaca live dari database LTOS.
            </p>
          </div>

          <div className="grid gap-4 p-6 xl:grid-cols-2">
            {facts.map(fact => (
              <div key={fact.id} className={`rounded-xl border p-4 ${fact.is_active ? 'border-black/10' : 'border-black/5 opacity-55'}`}>
                <form action={saveBusinessFact} className="space-y-3">
                  <input type="hidden" name="id" value={fact.id} />
                  <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
                    <div>
                      <label className={LABEL}>Kategori</label>
                      <select name="category" defaultValue={fact.category} className={FIELD}>
                        {['commercial', 'service', 'payment', 'location', 'policy', 'other'].map(value => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Label</label>
                      <input name="label" defaultValue={fact.label} className={FIELD} />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Nilai live</label>
                    <input name="value" defaultValue={fact.value} className={FIELD} />
                  </div>
                  <div>
                    <label className={LABEL}>Catatan / batas penggunaan</label>
                    <textarea name="notes" defaultValue={fact.notes ?? ''} rows={2} className={FIELD} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      key: {fact.fact_key} · {formatTime(fact.updated_at)}
                    </span>
                    <button className={SECONDARY}>Simpan</button>
                  </div>
                </form>
                <form action={toggleBusinessFact} className="mt-2">
                  <input type="hidden" name="id" value={fact.id} />
                  <input type="hidden" name="active" value={fact.is_active ? 'false' : 'true'} />
                  <button className="text-xs font-semibold text-slate-500 hover:text-slate-900">
                    {fact.is_active ? 'Nonaktifkan fakta' : 'Aktifkan fakta'}
                  </button>
                </form>
              </div>
            ))}

            <details className="rounded-xl border border-dashed border-black/20 p-4">
              <summary className="cursor-pointer text-sm font-semibold">+ Tambah fakta bisnis baru</summary>
              <form action={saveBusinessFact} className="mt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL}>Key unik</label>
                    <input name="factKey" required placeholder="contoh: payment_account_bca" className={FIELD} />
                  </div>
                  <div>
                    <label className={LABEL}>Kategori</label>
                    <select name="category" defaultValue="other" className={FIELD}>
                      {['commercial', 'service', 'payment', 'location', 'policy', 'other'].map(value => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <input name="label" required placeholder="Nama fakta" className={FIELD} />
                <input name="value" required placeholder="Nilai yang boleh dipakai AI" className={FIELD} />
                <textarea name="notes" rows={2} placeholder="Batas penggunaan / konteks" className={FIELD} />
                <button className={BUTTON}>Tambah fakta</button>
              </form>
            </details>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="border-b border-black/10 px-6 py-5">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <h2 className="text-lg font-semibold">2. Sales Brain & Playbook</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Cara Local Tailor berpikir, membalas, follow-up, closing, invoice, dan menjaga customer.
            </p>
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[380px_1fr]">
            <form action={createBrainEntry} className="h-fit space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="font-semibold">Tambah rule / pengetahuan</div>
              <div>
                <label className={LABEL}>Kategori</label>
                <select name="category" defaultValue="playbook" className={FIELD}>
                  {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <input name="title" required placeholder="Judul rule" className={FIELD} />
              <textarea name="content" required rows={6} placeholder="Instruksi yang harus dipelajari AI..." className={FIELD} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Stage</label>
                  <select name="stage" defaultValue="" className={FIELD}>
                    <option value="">Semua stage</option>
                    {['new', 'qualified', 'offer', 'hot', 'dp', 'order', 'lost'].map(stage => (
                      <option key={stage} value={stage}>{stage.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Prioritas 0–100</label>
                  <input name="priority" type="number" min="0" max="100" defaultValue="70" className={FIELD} />
                </div>
              </div>
              <input name="tags" placeholder="tags, dipisah, koma" className={FIELD} />
              <button className={BUTTON}>Masukkan ke Brain</button>
            </form>

            <div className="space-y-3">
              {brainEntries.map(item => (
                <div key={item.id} className={`rounded-xl border p-4 ${item.is_active ? 'border-black/10' : 'border-black/5 bg-slate-50 opacity-60'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#EFE8DB] px-2 py-1 text-[10px] font-semibold uppercase">
                          {CATEGORY_LABEL[item.category] || item.category}
                        </span>
                        {item.stage && <span className="text-[10px] font-semibold text-slate-500">{item.stage.toUpperCase()}</span>}
                        <span className="text-[10px] text-slate-400">P{item.priority}</span>
                      </div>
                      <h3 className="mt-2 font-semibold">{item.title}</h3>
                    </div>
                    <span className="text-[10px] text-slate-400">{item.source_type}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{item.content}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <form action={toggleBrainEntry}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="active" value={item.is_active ? 'false' : 'true'} />
                      <button className={SECONDARY}>{item.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                    </form>
                    {item.source_type === 'manual' && (
                      <form action={deleteBrainEntry}>
                        <input type="hidden" name="id" value={item.id} />
                        <button className="text-xs font-semibold text-red-700">Hapus</button>
                      </form>
                    )}
                    <span className="text-[10px] text-slate-400">{formatTime(item.updated_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="border-b border-black/10 px-6 py-5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <h2 className="text-lg font-semibold">3. Conversation Learning Library</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Format belajar: situasi → pesan customer → balasan ideal → alasan → outcome. Seed awal berasal dari pola
              Marketing Management, closing, follow-up, invoice, dan complaint yang sudah pernah dikerjakan.
            </p>
          </div>

          <div className="grid gap-6 p-6 xl:grid-cols-[430px_1fr]">
            <form action={createTrainingExample} className="h-fit space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="font-semibold">Tambah contoh nyata</div>
              <textarea name="situation" required rows={2} placeholder="Situasi customer" className={FIELD} />
              <textarea name="customerMessage" rows={2} placeholder="Pesan customer" className={FIELD} />
              <textarea name="idealReply" required rows={4} placeholder="Balasan Local Tailor yang ideal" className={FIELD} />
              <textarea name="rationale" rows={2} placeholder="Kenapa balasan ini tepat" className={FIELD} />
              <div className="grid grid-cols-2 gap-3">
                <select name="stageBefore" defaultValue="" className={FIELD}>
                  <option value="">Stage awal</option>
                  {['new', 'qualified', 'offer', 'hot', 'dp', 'order', 'lost'].map(stage => (
                    <option key={stage} value={stage}>{stage.toUpperCase()}</option>
                  ))}
                </select>
                <select name="stageAfter" defaultValue="" className={FIELD}>
                  <option value="">Stage sesudah</option>
                  {['new', 'qualified', 'offer', 'hot', 'dp', 'order', 'lost'].map(stage => (
                    <option key={stage} value={stage}>{stage.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select name="sourceType" defaultValue="manual" className={FIELD}>
                  <option value="manual">Manual</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="chatgpt_history">ChatGPT history</option>
                  <option value="ltos">LTOS</option>
                </select>
                <select name="outcome" defaultValue="progressed" className={FIELD}>
                  {['unknown', 'progressed', 'warm', 'hot', 'dp', 'order', 'lost', 'service'].map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </div>
              <input name="priority" type="number" min="0" max="100" defaultValue="80" className={FIELD} />
              <button className={BUTTON}>Simpan contoh</button>
            </form>

            <div className="space-y-3">
              {examples.map(example => (
                <details key={example.id} className={`rounded-xl border p-4 ${example.is_active ? 'border-black/10' : 'border-black/5 opacity-60'}`}>
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {example.stage_before?.toUpperCase() || 'ANY'} → {example.stage_after?.toUpperCase() || 'ANY'} · {example.outcome}
                        </div>
                        <div className="mt-1 font-medium">{example.situation}</div>
                      </div>
                      <span className="text-[10px] text-slate-400">{example.source_type}</span>
                    </div>
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    {example.customer_message && (
                      <div className="rounded-lg bg-slate-50 p-3">
                        <div className="text-[10px] font-semibold uppercase text-slate-400">Customer</div>
                        <div className="mt-1 whitespace-pre-wrap">{example.customer_message}</div>
                      </div>
                    )}
                    <div className="rounded-lg bg-[#EEF4F1] p-3">
                      <div className="text-[10px] font-semibold uppercase text-slate-400">Balasan ideal</div>
                      <div className="mt-1 whitespace-pre-wrap">{example.ideal_reply}</div>
                    </div>
                    {example.rationale && <p className="text-slate-600">{example.rationale}</p>}
                    <div className="flex items-center gap-3">
                      <form action={toggleTrainingExample}>
                        <input type="hidden" name="id" value={example.id} />
                        <input type="hidden" name="active" value={example.is_active ? 'false' : 'true'} />
                        <button className={SECONDARY}>{example.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                      </form>
                      {example.source_type === 'manual' && (
                        <form action={deleteTrainingExample}>
                          <input type="hidden" name="id" value={example.id} />
                          <button className="text-xs font-semibold text-red-700">Hapus</button>
                        </form>
                      )}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="border-b border-black/10 px-6 py-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-lg font-semibold">4. Training Review</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Tandai balasan AI bagus atau koreksi. Balasan yang direview otomatis menjadi contoh pembelajaran LTOS.
            </p>
          </div>

          <div className="divide-y divide-black/5">
            {(messagesResult.data ?? []).map(message => {
              const review = reviews.get(message.id)
              const relation = message.ai_sales_conversations as unknown
              const conversation = Array.isArray(relation) ? relation[0] : relation
              const conversationData =
                conversation && typeof conversation === 'object'
                  ? (conversation as { customer_name?: string | null; external_contact_id?: string | null })
                  : null

              return (
                <div key={message.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_430px]">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold">
                        {conversationData?.customer_name || conversationData?.external_contact_id || 'Customer'}
                      </span>
                      <span>·</span>
                      <span>{formatTime(message.created_at)}</span>
                      {review && (
                        <span className={`rounded-full px-2 py-0.5 font-semibold ${
                          review.verdict === 'good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {review.verdict === 'good' ? 'Bagus' : 'Perlu perbaikan'}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 whitespace-pre-wrap rounded-xl bg-[#EEF4F1] p-4 text-sm leading-relaxed">
                      {message.text_content}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <form action={reviewAiSalesMessage} className="space-y-2">
                      <input type="hidden" name="messageId" value={message.id} />
                      <input type="hidden" name="verdict" value="good" />
                      <input name="notes" placeholder="Catatan opsional: kenapa ini bagus" defaultValue={review?.verdict === 'good' ? review.notes ?? '' : ''} className={FIELD} />
                      <button className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">
                        <CheckCircle2 className="h-4 w-4" /> Tandai bagus
                      </button>
                    </form>

                    <form action={reviewAiSalesMessage} className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <input type="hidden" name="messageId" value={message.id} />
                      <input type="hidden" name="verdict" value="needs_fix" />
                      <textarea
                        name="correctedReply"
                        rows={3}
                        placeholder="Tulis versi yang seharusnya..."
                        defaultValue={review?.verdict === 'needs_fix' ? review.corrected_reply ?? '' : ''}
                        className={FIELD}
                      />
                      <input
                        name="notes"
                        placeholder="Kenapa perlu diperbaiki"
                        defaultValue={review?.verdict === 'needs_fix' ? review.notes ?? '' : ''}
                        className={FIELD}
                      />
                      <button className="rounded-lg bg-amber-800 px-3 py-2 text-xs font-semibold text-white">
                        Simpan koreksi
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
            {!messagesResult.data?.length && (
              <div className="p-8 text-center text-sm text-slate-500">
                Belum ada balasan AI tersimpan untuk direview.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
