import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { decideAiSalesReply } from '@/lib/ai-sales/agent'
import { loadAiSalesKnowledge } from '@/lib/ai-sales/knowledge'
import type { AiSalesMessage, AiSalesStage } from '@/lib/ai-sales/types'

export const dynamic = 'force-dynamic'

const CASES: Array<{ id: string; stage: AiSalesStage; customer: string }> = [
  {
    id: 'meta-opener',
    stage: 'new',
    customer: 'KangBro, bisa minta info lebih lengkap untuk custom thobenya? 😊',
  },
  {
    id: 'direct-price',
    stage: 'new',
    customer: 'Berapa harganya?',
  },
  {
    id: 'casual-remote',
    stage: 'new',
    customer: 'bang saya di makassar, ngukurnya gmna ya',
  },
  {
    id: 'formal',
    stage: 'new',
    customer: 'Assalamualaikum. Mohon informasi mengenai pemesanan custom thobe dan proses pengukurannya.',
  },
  {
    id: 'budget',
    stage: 'offer',
    customer: 'suka sih kang cuma sekarang belum cukup budgetnya',
  },
]

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV !== 'preview') {
    return new NextResponse('Not found', { status: 404 })
  }

  const url = new URL(request.url)
  const requestedId = url.searchParams.get('case') || CASES[0].id
  const testCase = CASES.find(item => item.id === requestedId)
  if (!testCase) return NextResponse.json({ error: 'Unknown case' }, { status: 400 })

  try {
    const supabase = createAdminClient()
    const knowledge = await loadAiSalesKnowledge(supabase)
    const history: AiSalesMessage[] = [{
      conversation_id: '00000000-0000-0000-0000-000000000000',
      direction: 'inbound',
      role: 'customer',
      provider_message_id: null,
      message_type: 'text',
      text_content: testCase.customer,
    }]

    const decision = await decideAiSalesReply({
      currentStage: testCase.stage,
      context: {},
      history,
      knowledge,
    })

    return NextResponse.json({
      counts: {
        facts: knowledge.businessFacts.length,
        brain: knowledge.brainEntries.length,
        examples: knowledge.trainingExamples.length,
      },
      testCase,
      decision,
    })
  } catch (error) {
    return NextResponse.json(
      { fatal: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
