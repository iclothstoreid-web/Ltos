import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

// Outcome signals are review candidates, never automatic training or business facts.
// Store message references rather than duplicating private WhatsApp content.
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
  if (error || !previous || previous.role !== 'assistant') return

  const text = customerText.toLowerCase()
  const signal = /\b(dp|invoice|pesan|order|transfer|fitting|ukur|jadi)\b/i.test(text)
    ? 'progressed'
    : /\b(salah|keliru|bukan itu|kecewa|tidak sesuai|nggak sesuai|komplain)\b/i.test(text)
      ? 'needs_review'
      : 'continued'

  await supabase.from('ai_sales_learning_observations').upsert({
    inbound_message_id: inboundMessageId,
    assistant_message_id: previous.id,
    conversation_id: conversationId,
    signal,
  }, { onConflict: 'inbound_message_id' })
}
