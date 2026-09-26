import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { appendOutboundMessage, createSalesAction } from './repository'
import { sendWhatsAppTemplate, sendWhatsAppText } from './whatsapp'
import type { AiSalesConversation } from './types'

type FollowUpJob = {
  id: string
  conversation_id: string
  inbound_at: string
  step: 1 | 2
  due_at: string
}

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const JAKARTA_OFFSET = 7 * HOUR

export function nextBusinessTime(date: Date): Date {
  const local = new Date(date.getTime() + JAKARTA_OFFSET)
  const hour = local.getUTCHours()
  if (hour >= 9 && hour < 20) return date
  if (hour >= 20) local.setUTCDate(local.getUTCDate() + 1)
  local.setUTCHours(9, 0, 0, 0)
  return new Date(local.getTime() - JAKARTA_OFFSET)
}

export function serviceWindowOpen(inboundAt: string, now: number): boolean {
  const inboundTime = new Date(inboundAt).getTime()
  return Number.isFinite(inboundTime) && now >= inboundTime && now < inboundTime + DAY - 10 * 60 * 1000
}

export function buildFollowUpText(context: Record<string, unknown>, step: 1 | 2): string {
  const lead = context.lead && typeof context.lead === 'object'
    ? context.lead as Record<string, unknown> : {}
  if (step === 2) return 'Kang, pilihan thobe custom yang kemarin masih saya catat. Kalau ingin lanjut, tinggal balas di sini ya, nanti saya bantu dari titik terakhir.'
  if (lead.fittingPreference) return 'Kang, pilihan thobe dan cara fitting yang tadi kita bahas sudah tercatat. Ada detail yang ingin dipastikan sebelum saya bantu lanjut ke invoice?'
  if (lead.model && lead.fabric) return 'Kang, arah model dan bahannya sudah kita dapat. Kalau berkenan, saya bantu pilih detail kerah yang paling pas supaya desainnya makin jelas ya?'
  if (lead.model) return 'Kang, model yang tadi kita bahas sudah jadi arah awal yang bagus. Mau saya bantu pilih bahan yang nyaman untuk pemakaiannya?'
  if (lead.occasion) return 'Kang, untuk kebutuhan yang tadi Kang ceritakan, saya bisa bantu pilih model yang paling sesuai. Sudah ada referensi yang disukai?'
  return 'Kang, kalau masih ingin lihat pilihan thobe customnya, saya bantu pelan-pelan ya. Biasanya akan dipakai untuk ibadah sehari-hari atau ada acara khusus?'
}

export function shouldPauseFollowUp(text: string): boolean {
  return /(jangan (?:chat|hubungi|follow)|stop|unsubscribe|tidak (?:jadi|tertarik)|nggak (?:jadi|tertarik)|belum (?:siap|ada dana|mampu)|nanti (?:saya|ana|aku) kabari|saya kabari|hubungi lagi (?:bulan|minggu|tanggal)|awal bulan depan)/i.test(text)
}

async function enabled(supabase: SupabaseClient): Promise<boolean> {
  if (process.env.WHATSAPP_AI_FORCE_DISABLED === 'true') return false
  const { data, error } = await supabase.from('ai_sales_runtime_settings')
    .select('key, bool_value')
    .in('key', ['whatsapp_auto_reply_enabled', 'whatsapp_follow_up_enabled'])
  if (error) throw error
  return ['whatsapp_auto_reply_enabled', 'whatsapp_follow_up_enabled']
    .every(key => data?.some(row => row.key === key && row.bool_value === true))
}

export async function cancelPendingFollowUps(supabase: SupabaseClient, conversationId: string): Promise<void> {
  const { error } = await supabase.from('ai_sales_follow_up_jobs')
    .update({ status: 'canceled', outcome: 'new_inbound', updated_at: new Date().toISOString() })
    .eq('conversation_id', conversationId).eq('status', 'queued')
  if (error) throw error
}

export async function scheduleFirstFollowUp(
  supabase: SupabaseClient,
  conversationId: string,
  latestCustomerText: string
): Promise<void> {
  if (shouldPauseFollowUp(latestCustomerText) || !(await enabled(supabase))) return
  const { data: conversation, error } = await supabase.from('ai_sales_conversations')
    .select('id, mode, stage, last_inbound_at, last_outbound_at')
    .eq('id', conversationId).single()
  if (error) throw error
  if (conversation.mode !== 'ai' || !['new', 'qualified', 'offer', 'hot'].includes(conversation.stage) ||
      !conversation.last_inbound_at || !conversation.last_outbound_at) return

  const dueAt = nextBusinessTime(new Date(new Date(conversation.last_outbound_at).getTime() + 3 * HOUR))
  const { error: insertError } = await supabase.from('ai_sales_follow_up_jobs').upsert({
    conversation_id: conversationId,
    inbound_at: conversation.last_inbound_at,
    step: 1,
    due_at: dueAt.toISOString(),
    status: 'queued',
  }, { onConflict: 'conversation_id,inbound_at,step', ignoreDuplicates: true })
  if (insertError) throw insertError
}

async function markJob(supabase: SupabaseClient, id: string, status: string, outcome: string, providerMessageId?: string | null) {
  const { error } = await supabase.from('ai_sales_follow_up_jobs').update({
    status, outcome, provider_message_id: providerMessageId ?? null, updated_at: new Date().toISOString(),
  }).eq('id', id).eq('status', 'claimed')
  if (error) throw error
}

async function processJob(supabase: SupabaseClient, job: FollowUpJob): Promise<void> {
  const { data, error } = await supabase.from('ai_sales_conversations')
    .select('*').eq('id', job.conversation_id).single()
  if (error) throw error
  const conversation = data as AiSalesConversation
  const { data: recent, error: recentError } = await supabase.from('ai_sales_messages')
    .select('direction, role, text_content, created_at')
    .eq('conversation_id', job.conversation_id)
    .order('created_at', { ascending: false }).limit(12)
  if (recentError) throw recentError

  const latestInbound = recent?.find(message => message.direction === 'inbound')
  const lastOutbound = recent?.find(message => message.direction === 'outbound')
  if (conversation.mode !== 'ai' || !['new', 'qualified', 'offer', 'hot'].includes(conversation.stage) ||
      conversation.last_inbound_at !== job.inbound_at ||
      !lastOutbound || lastOutbound.role !== 'assistant' ||
      (latestInbound?.text_content && shouldPauseFollowUp(latestInbound.text_content)) ||
      !(await enabled(supabase))) {
    await markJob(supabase, job.id, 'canceled', 'conversation_changed')
    return
  }

  const now = Date.now()
  const businessTime = nextBusinessTime(new Date(now))
  if (businessTime.getTime() > now) {
    await supabase.from('ai_sales_follow_up_jobs').update({
      status: 'queued', claimed_at: null, due_at: businessTime.toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', job.id).eq('status', 'claimed')
    return
  }

  const windowOpen = serviceWindowOpen(job.inbound_at, now)
  const templateName = process.env.AI_SALES_FOLLOWUP_TEMPLATE_NAME
  // The template name must be configured only after its exact language/body
  // has APPROVED status in WhatsApp Manager. No free-form text beyond 24h.
  if (!windowOpen && !templateName) {
    await markJob(supabase, job.id, 'skipped', 'approved_template_missing')
    return
  }

  const body = buildFollowUpText(conversation.context, job.step)
  try {
    const providerMessageId = windowOpen
      ? await sendWhatsAppText(conversation.external_contact_id, body)
      : await sendWhatsAppTemplate(conversation.external_contact_id, templateName!, 'id')
    await markJob(supabase, job.id, 'sent', windowOpen ? 'service_window' : 'approved_template', providerMessageId)
    await appendOutboundMessage(supabase, {
      conversation_id: conversation.id, direction: 'outbound', role: 'assistant',
      provider_message_id: providerMessageId, message_type: windowOpen ? 'text' : 'template',
      text_content: windowOpen ? body : '[Follow-up template disetujui Meta]',
      raw_payload: { follow_up_job_id: job.id, follow_up_step: job.step, template_name: windowOpen ? null : templateName },
      delivery_status: 'sent',
    })
    await createSalesAction(supabase, conversation.id, 'follow_up', { step: job.step, jobId: job.id }, 'executed')
    if (job.step === 1) {
      const dueAt = nextBusinessTime(new Date(now + 20 * HOUR))
      const { error: queueError } = await supabase.from('ai_sales_follow_up_jobs').insert({
        conversation_id: conversation.id, inbound_at: job.inbound_at,
        step: 2, due_at: dueAt.toISOString(), status: 'queued',
      })
      if (queueError && queueError.code !== '23505') throw queueError
    }
  } catch (sendError) {
    await markJob(supabase, job.id, 'failed', sendError instanceof Error ? sendError.message : String(sendError))
    throw sendError
  }
}

export async function runDueFollowUps(): Promise<{ claimed: number; errors: number }> {
  const supabase = createAdminClient()
  if (!(await enabled(supabase))) return { claimed: 0, errors: 0 }
  const { data, error } = await supabase.rpc('ai_sales_claim_due_follow_ups', { p_limit: 20 })
  if (error) throw error
  let errors = 0
  for (const job of (data ?? []) as FollowUpJob[]) {
    try { await processJob(supabase, job) } catch (error) {
      errors += 1
      // Claim is not retried automatically, including when provider accepted
      // a message but local persistence failed.
      console.error('AI Sales follow-up job failed', job.id, error)
    }
  }
  return { claimed: data?.length ?? 0, errors }
}
