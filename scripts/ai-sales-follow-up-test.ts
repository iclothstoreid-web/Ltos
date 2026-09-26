import assert from 'node:assert/strict'
import { buildFollowUpText, nextBusinessTime, serviceWindowOpen, shouldPauseFollowUp } from '../src/lib/ai-sales/follow-up'

// A lead messaging at 19:00 Jakarta must not receive a reminder at 22:00.
assert.equal(nextBusinessTime(new Date('2026-09-26T15:00:00Z')).toISOString(), '2026-09-27T02:00:00.000Z')
assert.equal(nextBusinessTime(new Date('2026-09-26T05:00:00Z')).toISOString(), '2026-09-26T05:00:00.000Z')
assert.equal(shouldPauseFollowUp('Nanti ana kabari kalau jadi pesan'), true)
assert.equal(shouldPauseFollowUp('Belum siap, mungkin bulan depan'), true)
assert.equal(shouldPauseFollowUp('Boleh lihat bahan lain?'), false)
assert.match(buildFollowUpText({ lead: { model: 'Saudi', fabric: 'Basic Twill Stretch' } }, 1), /kerah/)
assert.doesNotMatch(buildFollowUpText({ lead: { occasion: 'akad' } }, 1), /sehari-hari/)
const inbound = '2026-09-26T02:00:00.000Z'
assert.equal(serviceWindowOpen(inbound, new Date('2026-09-27T01:49:00Z').getTime()), true)
assert.equal(serviceWindowOpen(inbound, new Date('2026-09-27T01:51:00Z').getTime()), false)
process.stdout.write('AI Sales follow-up timing and context: 9 scenarios passed.\n')
