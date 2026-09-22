'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const BRAIN_PATH = '/owner/ai-sales/brain'
const STAGES = new Set(['new', 'qualified', 'offer', 'hot', 'dp', 'order', 'lost'])
const BRAIN_CATEGORIES = new Set([
  'identity',
  'style',
  'playbook',
  'closing',
  'follow_up',
  'objection',
  'invoice',
  'after_sales',
  'guardrail',
])
const FACT_CATEGORIES = new Set(['commercial', 'service', 'payment', 'location', 'policy', 'other'])
const OUTCOMES = new Set(['unknown', 'progressed', 'warm', 'hot', 'dp', 'order', 'lost', 'service'])

async function requireOwner() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/owner/login')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile || !['admin', 'owner'].includes(profile.role)) {
    throw new Error('Owner/Admin access required.')
  }

  return { supabase, user }
}

function cleanText(value: FormDataEntryValue | null, max = 8000) {
  return String(value ?? '').trim().slice(0, max)
}

function cleanStage(value: FormDataEntryValue | null) {
  const stage = cleanText(value, 24)
  return STAGES.has(stage) ? stage : null
}

function cleanPriority(value: FormDataEntryValue | null) {
  const number = Number(value ?? 50)
  if (!Number.isFinite(number)) return 50
  return Math.max(0, Math.min(100, Math.round(number)))
}

export async function saveBusinessFact(formData: FormData) {
  const id = cleanText(formData.get('id'), 64)
  const factKey = cleanText(formData.get('factKey'), 80)
  const category = cleanText(formData.get('category'), 32)
  const label = cleanText(formData.get('label'), 180)
  const value = cleanText(formData.get('value'), 2000)
  const notes = cleanText(formData.get('notes'), 3000)

  if (!FACT_CATEGORIES.has(category) || !label || !value) return
  const { supabase, user } = await requireOwner()

  if (id) {
    const { error } = await supabase
      .from('ai_sales_business_facts')
      .update({
        category,
        label,
        value,
        notes: notes || null,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) throw error
  } else {
    if (!factKey) return
    const { error } = await supabase.from('ai_sales_business_facts').insert({
      fact_key: factKey,
      category,
      label,
      value,
      notes: notes || null,
      source_note: 'Owner managed from AI Sales Brain',
      updated_by: user.id,
    })
    if (error) throw error
  }

  revalidatePath(BRAIN_PATH)
}

export async function toggleBusinessFact(formData: FormData) {
  const id = cleanText(formData.get('id'), 64)
  const active = cleanText(formData.get('active'), 8) === 'true'
  if (!id) return

  const { supabase, user } = await requireOwner()
  const { error } = await supabase
    .from('ai_sales_business_facts')
    .update({ is_active: active, updated_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  revalidatePath(BRAIN_PATH)
}

export async function createBrainEntry(formData: FormData) {
  const category = cleanText(formData.get('category'), 32)
  const title = cleanText(formData.get('title'), 180)
  const content = cleanText(formData.get('content'), 8000)
  const stage = cleanStage(formData.get('stage'))
  const tags = cleanText(formData.get('tags'), 1000)
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
    .slice(0, 20)
  const priority = cleanPriority(formData.get('priority'))

  if (!BRAIN_CATEGORIES.has(category) || !title || !content) return
  const { supabase, user } = await requireOwner()
  const { error } = await supabase.from('ai_sales_brain_entries').insert({
    category,
    title,
    content,
    stage,
    tags,
    priority,
    source_type: 'manual',
    source_ref: 'owner-brain',
    created_by: user.id,
  })
  if (error) throw error
  revalidatePath(BRAIN_PATH)
}

export async function toggleBrainEntry(formData: FormData) {
  const id = cleanText(formData.get('id'), 64)
  const active = cleanText(formData.get('active'), 8) === 'true'
  if (!id) return

  const { supabase } = await requireOwner()
  const { error } = await supabase
    .from('ai_sales_brain_entries')
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  revalidatePath(BRAIN_PATH)
}

export async function deleteBrainEntry(formData: FormData) {
  const id = cleanText(formData.get('id'), 64)
  if (!id) return

  const { supabase } = await requireOwner()
  const { error } = await supabase.from('ai_sales_brain_entries').delete().eq('id', id).eq('source_type', 'manual')
  if (error) throw error
  revalidatePath(BRAIN_PATH)
}

export async function createTrainingExample(formData: FormData) {
  const situation = cleanText(formData.get('situation'), 4000)
  const customerMessage = cleanText(formData.get('customerMessage'), 4000)
  const idealReply = cleanText(formData.get('idealReply'), 5000)
  const rationale = cleanText(formData.get('rationale'), 4000)
  const stageBefore = cleanStage(formData.get('stageBefore'))
  const stageAfter = cleanStage(formData.get('stageAfter'))
  const outcomeRaw = cleanText(formData.get('outcome'), 24)
  const outcome = OUTCOMES.has(outcomeRaw) ? outcomeRaw : 'unknown'
  const priority = cleanPriority(formData.get('priority'))
  const sourceTypeRaw = cleanText(formData.get('sourceType'), 32)
  const sourceType = ['manual', 'whatsapp', 'chatgpt_history', 'ltos'].includes(sourceTypeRaw)
    ? sourceTypeRaw
    : 'manual'

  if (!situation || !idealReply) return
  const { supabase, user } = await requireOwner()
  const { error } = await supabase.from('ai_sales_training_examples').insert({
    stage_before: stageBefore,
    stage_after: stageAfter,
    situation,
    customer_message: customerMessage || null,
    ideal_reply: idealReply,
    rationale: rationale || null,
    outcome,
    priority,
    source_type: sourceType,
    source_ref: sourceType === 'manual' ? 'owner-brain' : sourceType,
    created_by: user.id,
  })
  if (error) throw error
  revalidatePath(BRAIN_PATH)
}

export async function toggleTrainingExample(formData: FormData) {
  const id = cleanText(formData.get('id'), 64)
  const active = cleanText(formData.get('active'), 8) === 'true'
  if (!id) return

  const { supabase } = await requireOwner()
  const { error } = await supabase
    .from('ai_sales_training_examples')
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  revalidatePath(BRAIN_PATH)
}

export async function deleteTrainingExample(formData: FormData) {
  const id = cleanText(formData.get('id'), 64)
  if (!id) return

  const { supabase } = await requireOwner()
  const { error } = await supabase
    .from('ai_sales_training_examples')
    .delete()
    .eq('id', id)
    .eq('source_type', 'manual')
  if (error) throw error
  revalidatePath(BRAIN_PATH)
}

export async function reviewAiSalesMessage(formData: FormData) {
  const messageId = cleanText(formData.get('messageId'), 64)
  const verdict = cleanText(formData.get('verdict'), 16)
  const correctedReply = cleanText(formData.get('correctedReply'), 5000)
  const notes = cleanText(formData.get('notes'), 4000)
  if (!messageId || !['good', 'needs_fix'].includes(verdict)) return

  const { supabase, user } = await requireOwner()
  const { data: message, error: messageError } = await supabase
    .from('ai_sales_messages')
    .select('id, conversation_id, text_content, created_at, role, direction')
    .eq('id', messageId)
    .single()
  if (messageError || !message) throw messageError ?? new Error('AI message not found.')
  if (message.role !== 'assistant' || message.direction !== 'outbound') return

  const { error: reviewError } = await supabase.from('ai_sales_message_reviews').upsert(
    {
      message_id: messageId,
      verdict,
      corrected_reply: correctedReply || null,
      notes: notes || null,
      reviewed_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'message_id' }
  )
  if (reviewError) throw reviewError

  const idealReply = verdict === 'needs_fix' ? correctedReply : cleanText(message.text_content, 5000)
  if (idealReply) {
    const { data: previousCustomer } = await supabase
      .from('ai_sales_messages')
      .select('text_content')
      .eq('conversation_id', message.conversation_id)
      .eq('direction', 'inbound')
      .lt('created_at', message.created_at)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error: exampleError } = await supabase.from('ai_sales_training_examples').upsert(
      {
        situation:
          verdict === 'good'
            ? 'Balasan AI yang disetujui owner dari percakapan nyata LTOS.'
            : 'Balasan AI yang dikoreksi owner dari percakapan nyata LTOS.',
        customer_message: previousCustomer?.text_content || null,
        ideal_reply: idealReply,
        rationale: notes || (verdict === 'good' ? 'Owner menandai balasan ini bagus.' : 'Owner memperbaiki balasan AI.'),
        outcome: 'progressed',
        priority: verdict === 'needs_fix' ? 100 : 85,
        source_type: 'ltos',
        source_ref: messageId,
        source_key: `review:${messageId}`,
        is_active: true,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'source_key' }
    )
    if (exampleError) throw exampleError
  }

  revalidatePath(BRAIN_PATH)
}
