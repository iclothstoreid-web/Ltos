import 'server-only'
import { getOpenAIClient } from '@/lib/ai/client'
import type { AiSalesConversation } from './types'

type FollowUpMessage = { direction: string; role: string; text_content: string | null }

export async function composeContextualFollowUp(
  conversation: AiSalesConversation,
  recent: FollowUpMessage[],
  step: 1 | 2,
  fallback: string
): Promise<string> {
  const model = process.env.AI_SALES_MODEL
  if (!model) return fallback

  const history = recent
    .filter(message => message.text_content && ['customer', 'assistant', 'human'].includes(message.role))
    .slice(0, 10).reverse()
    .map(message => ({
      speaker: message.role === 'customer' ? 'customer' : 'Local Tailor',
      text: message.text_content!.slice(0, 700),
    }))
  const lead = conversation.context.lead && typeof conversation.context.lead === 'object'
    ? conversation.context.lead as Record<string, unknown> : {}

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `Tulis SATU follow-up WhatsApp Local Tailor dalam bahasa pelanggan. Balas sebagai sales manusia yang mendengarkan, hangat, singkat (maksimal dua kalimat). Ini follow-up ke-${step}, bukan jawaban pertama. Rujuk HANYA pilihan, pertanyaan, atau kekhawatiran yang benar-benar terlihat dalam percakapan dan konteks. Jangan ulang sapaan generik, katalog, harga, rekening, stok, SLA, status order, klaim foto/video yang belum diverifikasi, urgensi palsu, atau pertanyaan yang sudah dijawab. Jangan panggil Kang/Pak/Ibu kalau sapaan itu tidak jelas. Ajukan paling banyak satu langkah ringan yang nyambung; bila customer sudah menyatakan akan menghubungi sendiri atau tidak ingin dihubungi, jawab dengan teks kosong. Jangan sebut analisis tone atau psikologi. Keluarkan JSON {"reply":"..."} saja.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            stage: conversation.stage,
            lead,
            conversationSense: conversation.context.conversationSense ?? null,
            messages: history,
          }),
        },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 220,
    })
    const parsed = JSON.parse(response.choices[0]?.message?.content ?? '{}') as { reply?: unknown }
    if (typeof parsed.reply !== 'string') return fallback
    const reply = parsed.reply.trim()
    if (!reply) return ''
    if (reply.length > 450 || /(?:Rp\s*[\d.,]+|rekening|stok (?:ready|tersedia)|pasti selesai)/i.test(reply)) return fallback
    return reply
  } catch {
    return fallback
  }
}
