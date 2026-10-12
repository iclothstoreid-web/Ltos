import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

// Outcome signals are review candidates, never automatic business truth.
// We learn from both AI replies and owner/admin replies. Human replies are
// especially valuable as style/decision-flow evidence, but still require
// retrieval-time sanitization before they can influence a future reply.
export async function recordConversationLearningSignal(
  supabase: SupabaseClient,
  conversationId: string,
  inboundMessageId: string,
  customerText: string
): Promise<void> {
  const { data: previous, error } = await supabase
    .from('ai_sales_messages')
    .select('id, role, created_at')
    .eq('conversation_id', conversationId)
    .eq('direction', 'outbound')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !previous || !['assistant', 'human'].includes(previous.role)) return

  const text = customerText.toLowerCase()

  // Correction / complaint signals must win over generic words such as "ukur"
  // or "jadi", otherwise a bad reply can accidentally be promoted as progress.
  const signal = /\b(salah|keliru|bukan itu|bukan begitu|kecewa|tidak sesuai|nggak sesuai|ga sesuai|komplain|pusing|muter|berputar|ngulang|nggak nyambung|tidak nyambung)\b/i.test(text)
    ? 'needs_review'
    : /\b(dp|invoice|pesan|order|transfer|fitting|ukur|measurement|lock|gas|ambil|cocok|suka|lanjut|payment|bayar|jadi)\b/i.test(text) &&
      !/\b(tidak jadi|nggak jadi|ga jadi|belum jadi)\b/i.test(text)
      ? 'progressed'
      : 'continued'

  await supabase.from('ai_sales_learning_observations').upsert({
    inbound_message_id: inboundMessageId,
    assistant_message_id: previous.id,
    conversation_id: conversationId,
    signal,
  }, { onConflict: 'inbound_message_id' })
}
