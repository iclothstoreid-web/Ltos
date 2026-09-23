import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { decideAiSalesReply } from '@/lib/ai-sales/agent'
import { loadAiSalesKnowledge } from '@/lib/ai-sales/knowledge'
import type { AiSalesMessage, AiSalesStage } from '@/lib/ai-sales/types'

export const dynamic = 'force-dynamic'

const CASES: Array<{
  id: string
  stage: AiSalesStage
  context?: Record<string, unknown>
  customer: string
}> = [
  {
    id: 'new-price-remote',
    stage: 'new',
    customer: 'Assalamualaikum, saya di Makassar. Cara ukurnya gimana dan harganya berapa?',
  },
  {
    id: 'budget-below-min',
    stage: 'offer',
    customer: 'Saya suka, tapi budget saya paling tinggi 500 ribu.',
  },
  {
    id: 'height-weight-size',
    stage: 'qualified',
    customer: 'Tinggi 168 berat 104, kira-kira size saya apa?',
  },
  {
    id: 'reference-garment',
    stage: 'qualified',
    customer: 'Saya ada thobe size 56 yang paling nyaman. Bisa pakai itu saja buat acuan?',
  },
  {
    id: 'dp-account-missing',
    stage: 'hot',
    customer: 'Saya jadi pesan. DP berapa dan transfer ke rekening mana?',
  },
  {
    id: 'complaint',
    stage: 'order',
    customer: 'Barang sudah sampai tapi kerung ketiak belakang ketarik dan biceps sempit.',
  },
  {
    id: 'existing-order-status',
    stage: 'order',
    context: { orderId: 'TEST-ORDER', orderStatus: 'production' },
    customer: 'Pesanan saya sudah dikirim belum?',
  },
  {
    id: 'external-reference',
    stage: 'qualified',
    customer: 'Saya punya foto thobe dari luar. Bisa dibuat sama persis?',
  },
  {
    id: 'color-availability',
    stage: 'qualified',
    customer: 'Untuk bahan premium itu warna lain apa saja yang tersedia?',
  },
  {
    id: 'multiple-buying-signals',
    stage: 'hot',
    customer: 'Saya mau 2 pcs. Bisa COD? Ada diskon? Size saya apa?',
  },
]

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV !== 'preview') {
    return new NextResponse('Not found', { status: 404 })
  }


  try {
    const url = new URL(request.url)
    const requestedId = url.searchParams.get('case') || CASES[0].id
    const testCase = CASES.find(item => item.id === requestedId)
    if (!testCase) {
      return NextResponse.json({ error: 'Unknown case', cases: CASES.map(item => item.id) }, { status: 400 })
    }

    const supabase = createAdminClient()
    const knowledge = await loadAiSalesKnowledge(supabase)
    const history: AiSalesMessage[] = [
      {
        conversation_id: '00000000-0000-0000-0000-000000000000',
        direction: 'inbound',
        role: 'customer',
        provider_message_id: null,
        message_type: 'text',
        text_content: testCase.customer,
      },
    ]

    const decision = await decideAiSalesReply({
      currentStage: testCase.stage,
      context: testCase.context ?? {},
      history,
      knowledge,
    })

    return NextResponse.json({
      model: process.env.AI_SALES_MODEL || null,
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
      {
        fatal: error instanceof Error ? error.message : String(error),
        hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
        model: process.env.AI_SALES_MODEL || null,
        hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasServiceKey: Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
      },
      { status: 500 }
    )
  }
}