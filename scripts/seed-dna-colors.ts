// DNA Color Library V1 — swatch generation + upload only.
//
// This script does NOT touch the `dna_colors` table — inserting rows is
// done separately (direct authenticated SQL), so this file's only job is
// the part nothing else can do: render a real 512x512 solid-color PNG per
// color (no network image fetch, no AI, just pixel math) and upload it to
// the `dna-color-swatches` Storage bucket (see migration
// 20260823020000_add_dna_color_swatch_storage.sql), then print a JSON
// manifest (name/slug/family/hex/rgb/lab/hsv/prompt/reference_image) to
// stdout for the caller to use when inserting rows.
//
// No new npm dependency: the PNG encoder below is hand-written using only
// Node's built-in `zlib` (for the IDAT deflate stream) and a small CRC32
// implementation — sharp/canvas/pngjs are unnecessary for a flat solid-color
// image.
//
// Usage: npx tsx scripts/seed-dna-colors.ts > scratchpad/dna-colors-manifest.json

import { config as loadEnv } from 'dotenv'
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

loadEnv({ path: '.env.local', quiet: true })

// Written to explicitly (not console.log) — dotenv's own "injected env"
// banner prints to stdout too, which would otherwise corrupt the JSON.
const MANIFEST_OUT_PATH = process.argv[2]
if (!MANIFEST_OUT_PATH) {
  console.error('Usage: npx tsx scripts/seed-dna-colors.ts <output-manifest-path.json>')
  process.exit(1)
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const BUCKET = 'dna-color-swatches'
const SIZE = 512

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

// ---------------------------------------------------------------------
// Color math — hex -> rgb -> hsv -> lab (sRGB, D65 illuminant, standard
// formulas; deterministic, no external library).
// ---------------------------------------------------------------------
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return [r, g, b]
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rf = r / 255
  const gf = g / 255
  const bf = b / 255
  const max = Math.max(rf, gf, bf)
  const min = Math.min(rf, gf, bf)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rf) h = ((gf - bf) / d) % 6
    else if (max === gf) h = (bf - rf) / d + 2
    else h = (rf - gf) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  const v = max
  return [Math.round(h), Math.round(s * 100), Math.round(v * 100)]
}

function srgbChannelToLinear(c: number): number {
  const cs = c / 255
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
}

// sRGB -> XYZ (D65) -> CIE LAB
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = srgbChannelToLinear(r)
  const gl = srgbChannelToLinear(g)
  const bl = srgbChannelToLinear(b)

  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175
  const z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041

  // D65 reference white
  const xn = 0.95047
  const yn = 1.0
  const zn = 1.08883

  const fx = labF(x / xn)
  const fy = labF(y / yn)
  const fz = labF(z / zn)

  const L = 116 * fy - 16
  const a = 500 * (fx - fy)
  const bb = 200 * (fy - fz)

  return [Math.round(L), Math.round(a), Math.round(bb)]
}

function labF(t: number): number {
  const delta = 6 / 29
  return t > delta ** 3 ? Math.cbrt(t) : t / (3 * delta ** 2) + 4 / 29
}

// ---------------------------------------------------------------------
// Minimal PNG encoder — solid color, no filter tricks, no palette. Each
// scanline is [filter byte 0][RGB * width], deflated once as the IDAT
// stream. CRC32 implemented directly (standard PNG/zlib polynomial).
// ---------------------------------------------------------------------
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf: Buffer): number {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData), 0)
  return Buffer.concat([length, typeAndData, crc])
}

function encodeSolidColorPng(r: number, g: number, b: number, size: number): Buffer {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0) // width
  ihdrData.writeUInt32BE(size, 4) // height
  ihdrData.writeUInt8(8, 8) // bit depth
  ihdrData.writeUInt8(2, 9) // color type 2 = truecolor (RGB)
  ihdrData.writeUInt8(0, 10) // compression
  ihdrData.writeUInt8(0, 11) // filter
  ihdrData.writeUInt8(0, 12) // interlace
  const ihdr = chunk('IHDR', ihdrData)

  const rowBytes = 1 + size * 3
  const raw = Buffer.alloc(rowBytes * size)
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowBytes
    raw[rowStart] = 0 // filter type: None
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3
      raw[px] = r
      raw[px + 1] = g
      raw[px + 2] = b
    }
  }
  const idat = chunk('IDAT', deflateSync(raw, { level: 9 }))
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

// ---------------------------------------------------------------------
// Color list — DNA Color Library V1 brief, minus 3 exact-name collisions
// already active in production (`Black` #1A1A1A, `Maroon` #800020, `Navy`
// #000080 — confirmed via live query, 2026-08-23). Per the brief's own
// "Jika Name sudah ada, skip" rule, these are not re-created, and existing
// rows are not touched/overwritten.
// ---------------------------------------------------------------------
interface ColorSeed {
  name: string
  hex: string
  family: string
  prompt: string
}

const COLORS: ColorSeed[] = [
  // BLACK (Black itself skipped — already active)
  { name: 'Charcoal', hex: '#36454F', family: 'black', prompt: 'Use dark charcoal grey (#36454F) as the garment color.' },
  { name: 'Graphite', hex: '#4B4F54', family: 'black', prompt: 'Use cool graphite grey (#4B4F54) as the garment color.' },

  // WHITE
  { name: 'White', hex: '#FFFFFF', family: 'white', prompt: 'Use pure bright white (#FFFFFF) as the garment color.' },
  { name: 'Off White', hex: '#F8F6F0', family: 'white', prompt: 'Use soft off-white (#F8F6F0) as the garment color.' },
  { name: 'Ivory', hex: '#FFFFF0', family: 'white', prompt: 'Use warm ivory white (#FFFFF0) as the garment color.' },
  { name: 'Cream', hex: '#FFF5D6', family: 'white', prompt: 'Use light creamy yellow-white (#FFF5D6) as the garment color.' },
  { name: 'Bone', hex: '#E3DAC9', family: 'white', prompt: 'Use pale bone beige (#E3DAC9) as the garment color.' },

  // BLUE (Navy itself skipped — already active)
  { name: 'Royal Navy', hex: '#243A73', family: 'blue', prompt: 'Use deep royal navy blue (#243A73) as the garment color.' },
  { name: 'Midnight Blue', hex: '#191970', family: 'blue', prompt: 'Use very dark midnight blue (#191970) as the garment color.' },
  { name: 'Blue Slate', hex: '#5A6F8E', family: 'blue', prompt: 'Use muted slate blue (#5A6F8E) as the garment color.' },
  { name: 'Dusty Blue', hex: '#6E8CA6', family: 'blue', prompt: 'Use soft dusty blue (#6E8CA6) as the garment color.' },
  { name: 'Steel Blue', hex: '#4682B4', family: 'blue', prompt: 'Use cool steel blue (#4682B4) as the garment color.' },
  { name: 'Sky Blue', hex: '#87CEEB', family: 'blue', prompt: 'Use light sky blue (#87CEEB) as the garment color.' },
  { name: 'Ocean Blue', hex: '#2E8BC0', family: 'blue', prompt: 'Use vivid ocean blue (#2E8BC0) as the garment color.' },
  { name: 'Teal Blue', hex: '#367588', family: 'blue', prompt: 'Use deep teal blue (#367588) as the garment color.' },

  // GREEN
  { name: 'Olive', hex: '#708238', family: 'green', prompt: 'Use muted olive green (#708238) as the garment color.' },
  { name: 'Army Green', hex: '#4B5320', family: 'green', prompt: 'Use dark army green (#4B5320) as the garment color.' },
  { name: 'Sage', hex: '#9CAF88', family: 'green', prompt: 'Use soft sage green (#9CAF88) as the garment color.' },
  { name: 'Moss Green', hex: '#8A9A5B', family: 'green', prompt: 'Use earthy moss green (#8A9A5B) as the garment color.' },
  { name: 'Forest Green', hex: '#355E3B', family: 'green', prompt: 'Use deep forest green (#355E3B) as the garment color.' },
  { name: 'Emerald', hex: '#50C878', family: 'green', prompt: 'Use vivid emerald green (#50C878) as the garment color.' },
  { name: 'Hunter Green', hex: '#355E3B', family: 'green', prompt: 'Use dark hunter green (#355E3B) as the garment color.' },

  // YELLOW
  { name: 'Mustard', hex: '#D4A017', family: 'yellow', prompt: 'Use warm mustard yellow (#D4A017) as the garment color.' },
  { name: 'Sand', hex: '#C2B280', family: 'yellow', prompt: 'Use pale sandy beige-yellow (#C2B280) as the garment color.' },
  { name: 'Khaki', hex: '#C3B091', family: 'yellow', prompt: 'Use muted khaki tan (#C3B091) as the garment color.' },
  { name: 'Camel', hex: '#C19A6B', family: 'yellow', prompt: 'Use warm camel tan (#C19A6B) as the garment color.' },
  { name: 'Gold', hex: '#D4AF37', family: 'yellow', prompt: 'Use rich metallic gold (#D4AF37) as the garment color.' },

  // BROWN
  { name: 'Brown', hex: '#8B5A2B', family: 'brown', prompt: 'Use warm medium brown (#8B5A2B) as the garment color.' },
  { name: 'Chocolate', hex: '#5C4033', family: 'brown', prompt: 'Use deep chocolate brown (#5C4033) as the garment color.' },
  { name: 'Coffee', hex: '#6F4E37', family: 'brown', prompt: 'Use rich coffee brown (#6F4E37) as the garment color.' },
  { name: 'Espresso', hex: '#4B3621', family: 'brown', prompt: 'Use very dark espresso brown (#4B3621) as the garment color.' },
  { name: 'Walnut', hex: '#773F1A', family: 'brown', prompt: 'Use warm walnut brown (#773F1A) as the garment color.' },
  { name: 'Tan', hex: '#D2B48C', family: 'brown', prompt: 'Use light tan (#D2B48C) as the garment color.' },
  { name: 'Mocha', hex: '#967969', family: 'brown', prompt: 'Use muted mocha brown (#967969) as the garment color.' },

  // RED (Maroon itself skipped — already active)
  { name: 'Burgundy', hex: '#800020', family: 'red', prompt: 'Use deep burgundy red (#800020) as the garment color.' },
  { name: 'Wine', hex: '#722F37', family: 'red', prompt: 'Use dark wine red (#722F37) as the garment color.' },
  { name: 'Brick Red', hex: '#8A3B2A', family: 'red', prompt: 'Use muted brick red (#8A3B2A) as the garment color.' },
  { name: 'Rust', hex: '#B7410E', family: 'red', prompt: 'Use warm rust orange-red (#B7410E) as the garment color.' },
  { name: 'Crimson', hex: '#990000', family: 'red', prompt: 'Use bold crimson red (#990000) as the garment color.' },

  // PURPLE
  { name: 'Plum', hex: '#673147', family: 'purple', prompt: 'Use deep plum purple (#673147) as the garment color.' },
  { name: 'Aubergine', hex: '#3D0734', family: 'purple', prompt: 'Use very dark aubergine purple (#3D0734) as the garment color.' },
  { name: 'Deep Purple', hex: '#4B0082', family: 'purple', prompt: 'Use rich deep purple (#4B0082) as the garment color.' },

  // NEUTRAL
  { name: 'Stone', hex: '#B8B5A6', family: 'neutral', prompt: 'Use muted stone grey-beige (#B8B5A6) as the garment color.' },
  { name: 'Taupe', hex: '#8B7E74', family: 'neutral', prompt: 'Use warm taupe grey-brown (#8B7E74) as the garment color.' },
  { name: 'Ash Grey', hex: '#B2BEB5', family: 'neutral', prompt: 'Use cool ash grey (#B2BEB5) as the garment color.' },
  { name: 'Silver Grey', hex: '#C0C0C0', family: 'neutral', prompt: 'Use light silver grey (#C0C0C0) as the garment color.' },
]

// Same slugify convention as src/lib/design/dnaColors.ts (lowercase,
// non-alphanumeric runs collapsed to single hyphens, trimmed).
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uploadSwatch(slug: string, png: Buffer): Promise<string> {
  const path = `${slug}.png`
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY as string,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
    },
    body: new Uint8Array(png),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upload failed for ${slug}: ${res.status} ${text}`)
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

async function main() {
  const manifest: Array<ColorSeed & { slug: string; rgb: string; hsv: string; lab: string; reference_image: string }> = []

  for (const color of COLORS) {
    const slug = slugify(color.name)
    const [r, g, b] = hexToRgb(color.hex)
    const [h, s, v] = rgbToHsv(r, g, b)
    const [L, a, bb] = rgbToLab(r, g, b)

    const png = encodeSolidColorPng(r, g, b, SIZE)
    const referenceImage = await uploadSwatch(slug, png)

    manifest.push({
      ...color,
      slug,
      rgb: `${r}, ${g}, ${b}`,
      hsv: `${h}, ${s}%, ${v}%`,
      lab: `${L}, ${a}, ${bb}`,
      reference_image: referenceImage,
    })

    console.error(`Uploaded ${color.name} (${slug}.png) -> ${referenceImage}`)
  }

  writeFileSync(MANIFEST_OUT_PATH, JSON.stringify(manifest, null, 2))
  console.error(`\nManifest written to ${MANIFEST_OUT_PATH} (${manifest.length} colors)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
