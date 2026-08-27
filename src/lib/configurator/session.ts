import 'server-only'
import crypto from 'crypto'
import type { DesignConfig, ServiceLevel } from '@/types/configurator'

// Stateless, DB-free "save" — no schema change, no migration, per the W2-4
// brief. The whole session (config + service level) is encoded into a
// signed, URL-safe token that IS the /design/[slug] slug: there is nothing
// to look up server-side, so a shared link keeps working across cold
// starts, restarts, and multiple serverless instances without any storage
// at all.
//
// Not encrypted (only signed): the payload only ever contains master-data
// option ids already publicly readable via GET /api/design/options, so
// there's nothing confidential to hide — HMAC integrity (tamper-evidence)
// is what actually matters here, and keeps this simple.
//
// ENGINE SEAM: encodeDesignSession/decodeDesignSession are the only two
// functions any caller (the save route, /design/[slug]) ever calls. A
// production swap to real persistence (insert a row, return its id) only
// needs to change these two function bodies — e.g. encode -> INSERT +
// return id, decode -> SELECT by id — every call site stays the same.

export interface DesignSession {
  config: DesignConfig
  serviceLevel: ServiceLevel
  createdAt: string
}

const SECRET = process.env.CONFIGURATOR_SESSION_SECRET || 'ltos-dev-only-insecure-secret-w2-4'

if (!process.env.CONFIGURATOR_SESSION_SECRET && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn('[configurator/session] CONFIGURATOR_SESSION_SECRET is not set — using the dev fallback in production.')
}

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlToBuffer(str: string): Buffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=')
  return Buffer.from(padded, 'base64')
}

function sign(payload: string): string {
  return base64url(crypto.createHmac('sha256', SECRET).update(payload).digest())
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

// Short keys mirror the same compaction convention hashEstimateInput()
// already uses in estimate.ts — keeps the URL slug short.
interface CompactSession {
  m: string | null
  c: string | null
  cu: string | null
  f: string | null
  co: string | null
  // Sprint DS-UX follow-up — Saku / Plaket / Handmade Zig-Zag. Optional in
  // the wire format: an older slug simply omits them and expand() reads
  // them as null, so every previously shared /design/<slug> URL keeps
  // resolving unchanged.
  sk?: string | null
  pl?: string | null
  hz?: string | null
  e: string | null
  a: string[]
  s: ServiceLevel
  t: string
}

function compact(session: DesignSession): CompactSession {
  return {
    m: session.config.modelId,
    c: session.config.collarId,
    cu: session.config.cuffId,
    f: session.config.fabricId,
    co: session.config.colorId,
    sk: session.config.pocketId,
    pl: session.config.placketId,
    hz: session.config.zigzagId,
    e: session.config.embroidery,
    a: session.config.accessories,
    s: session.serviceLevel,
    t: session.createdAt,
  }
}

function expand(raw: CompactSession): DesignSession {
  return {
    config: {
      modelId: raw.m ?? null,
      collarId: raw.c ?? null,
      cuffId: raw.cu ?? null,
      fabricId: raw.f ?? null,
      colorId: raw.co ?? null,
      pocketId: raw.sk ?? null,
      placketId: raw.pl ?? null,
      zigzagId: raw.hz ?? null,
      embroidery: raw.e ?? null,
      accessories: Array.isArray(raw.a) ? raw.a : [],
    },
    serviceLevel: raw.s ?? 'standard',
    createdAt: raw.t ?? new Date().toISOString(),
  }
}

export function encodeDesignSession(session: DesignSession): string {
  const payload = base64url(Buffer.from(JSON.stringify(compact(session)), 'utf8'))
  return `${payload}.${sign(payload)}`
}

export function decodeDesignSession(slug: string): DesignSession | null {
  const dot = slug.lastIndexOf('.')
  if (dot === -1) return null

  const payload = slug.slice(0, dot)
  const signature = slug.slice(dot + 1)
  if (!payload || !signature) return null
  if (!timingSafeEqual(sign(payload), signature)) return null

  try {
    const raw = JSON.parse(base64urlToBuffer(payload).toString('utf8')) as CompactSession
    return expand(raw)
  } catch {
    return null
  }
}
