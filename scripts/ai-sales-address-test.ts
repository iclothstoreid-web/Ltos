import assert from 'node:assert/strict'
import { decideAiSalesReply } from '../src/lib/ai-sales/agent'
import type { AiSalesKnowledge, AiSalesMessage } from '../src/lib/ai-sales/types'

const knowledge: AiSalesKnowledge = {
  options: [], fabrics: [], commercialRules: { minDpPercent: null, fullPaymentOnly: null },
  brainEntries: [], trainingExamples: [],
  businessFacts: [{
    key: 'showroom_address', category: 'location', label: 'Alamat showroom',
    value: 'Jl. Gamelan No. 10, Turangga, Buahbatu, Kota Bandung, Jawa Barat', notes: null,
  }],
}
const history: AiSalesMessage[] = [{
  conversation_id: 'test', direction: 'inbound', role: 'customer', provider_message_id: 'test',
  message_type: 'text', text_content: 'Boleh minta alamat di Bandung? Saya mau lihat showroom.',
}]

async function main() {
  const correct = await decideAiSalesReply({ currentStage: 'qualified', context: {}, history, knowledge })
  assert.match(correct.reply, /Gamelan No\. 10, Turangga, Buahbatu/)
  assert.doesNotMatch(correct.reply, /Gatot Subroto|jam operasional|kapan saja/i)
  assert.equal(correct.shouldHandoff, false)
  const missing = await decideAiSalesReply({ currentStage: 'qualified', context: {}, history,
    knowledge: { ...knowledge, businessFacts: [] } })
  assert.equal(missing.shouldHandoff, true)
  assert.doesNotMatch(missing.reply, /Gamelan|Gatot/)
  process.stdout.write('AI Sales showroom address: verified fact and missing-fact handoff passed.\n')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
