import assert from 'node:assert/strict'
import { parseWhatsAppInboundMessages, parseWhatsAppMessageEchoes } from '../src/lib/ai-sales/whatsapp'

const payload = {
  entry: [{ changes: [
    { field: 'smb_message_echoes', value: { message_echoes: [
      { id: 'echo-1', from: 'business', to: 'customer', type: 'text', text: { body: 'Siap Pak, kerah Haybah kita catat.' } },
      { id: 'echo-2', from: 'business', to: 'customer', type: 'image', image: { caption: 'Referensi kerah' } },
    ] } },
    { field: 'messages', value: { messages: [
      { id: 'in-1', from: 'customer', type: 'text', text: { body: 'Baik Kang' } },
    ] } },
  ] }],
}

const echoes = parseWhatsAppMessageEchoes(payload)
assert.deepEqual(echoes.map(e => [e.providerMessageId, e.to, e.type, e.text]), [
  ['echo-1', 'customer', 'text', 'Siap Pak, kerah Haybah kita catat.'],
  ['echo-2', 'customer', 'image', 'Referensi kerah'],
])
assert.deepEqual(parseWhatsAppInboundMessages(payload).map(m => m.providerMessageId), ['in-1'])
assert.deepEqual(parseWhatsAppMessageEchoes({ entry: [{ changes: [{ field: 'messages', value: { messages: [] } }] }] }), [])
process.stdout.write('WhatsApp echo parsing: 3 scenarios passed.\n')
