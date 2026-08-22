import type { KnowledgeCategorySlug } from '@/lib/knowledge/types'

// Sprint W6-9 — Topic Coverage Matrix. Tracks coverage at a finer grain
// than "does the category have articles" (all 9 categories do, as of
// W6-10) — each row is a real sub-topic within a cluster, honestly marked
// 'planned' where no article exists yet rather than padded to look
// complete. This is the reference for what W6-11+ should write next.

export type CoverageStatus = 'complete' | 'partial' | 'planned'

export interface CoverageEntry {
  category: KnowledgeCategorySlug
  topic: string
  status: CoverageStatus
  notes: string
}

export const COVERAGE_MATRIX: CoverageEntry[] = [
  { category: 'fabrics', topic: 'Bahan inti (linen, katun varian, wool blend, sintetis)', status: 'complete', notes: '10 artikel live, semua bahan utama tercakup' },
  { category: 'fabrics', topic: 'Bahan musiman/edisi terbatas', status: 'planned', notes: 'Belum ada artikel — kandidat sprint berikutnya' },
  { category: 'fabrics', topic: 'Sustainability/sumber bahan', status: 'planned', notes: 'Belum dibahas sama sekali' },

  { category: 'measurements', topic: '5 titik ukur inti', status: 'complete', notes: 'Leher, bahu, dada, lengan, panjang badan semua tercakup' },
  { category: 'measurements', topic: 'Size guide dan fit comparison', status: 'complete', notes: 'thobe-size-guide + slim-vs-regular-fit' },
  { category: 'measurements', topic: 'Pengukuran untuk anak/remaja', status: 'planned', notes: 'Konten saat ini berasumsi dewasa' },

  { category: 'styling', topic: 'Warna inti (navy, olive, hitam, putih)', status: 'complete', notes: '4 warna utama tercakup' },
  { category: 'styling', topic: 'Konteks acara (formal, casual, wedding, umrah)', status: 'complete', notes: '4 konteks utama tercakup' },
  { category: 'styling', topic: 'Aksesori detail (bisht, peci, jam tangan) mendalam', status: 'partial', notes: 'Disinggung di beberapa artikel, belum ada artikel dedicated' },

  { category: 'wedding', topic: 'Akad, resepsi, couple, family, timeline, warna, premium', status: 'complete', notes: '8 artikel W6-5 live' },
  { category: 'wedding', topic: 'Wedding vendor coordination (fotografer, MUA, dst.)', status: 'planned', notes: 'Di luar scope tailoring, kandidat partnership content' },

  { category: 'umrah', topic: 'Bahan, jumlah, warna, packing, perawatan, iklim, premium, custom', status: 'complete', notes: '8 artikel W6-5 live' },
  { category: 'umrah', topic: 'Haji-specific content (durasi lebih panjang, ihram)', status: 'planned', notes: 'Umrah dan haji punya kebutuhan berbeda, belum dibahas terpisah' },

  { category: 'tailoring', topic: 'Bespoke, pola, interlining, konstruksi, jahitan tangan, QC', status: 'complete', notes: '8 artikel W6-6 live' },
  { category: 'tailoring', topic: 'Video/visual dokumentasi proses produksi', status: 'planned', notes: 'Konten saat ini teks-only, tidak ada foto/video proses nyata' },

  { category: 'care', topic: 'Cuci, setrika, simpan, kerutan, putih, wool, dry clean, usia pakai', status: 'complete', notes: '8 artikel W6-6 live' },
  { category: 'care', topic: 'Penghilangan noda spesifik per jenis noda', status: 'partial', notes: 'Disinggung umum di remove-wrinkles, belum artikel khusus per jenis noda' },

  { category: 'questions', topic: 'FAQ question-first lintas kategori', status: 'complete', notes: '24 halaman W6-10, menjawab pertanyaan spesifik snippet-friendly' },
  { category: 'questions', topic: 'Voice search / conversational query coverage', status: 'partial', notes: '24 halaman saat ini menjawab format teks singkat, belum dioptimalkan khusus voice search' },

  { category: 'bogor', topic: 'Positioning lokal Bogor (custom, bespoke, wedding, umrah)', status: 'complete', notes: '5 halaman W6-10, tanpa klaim palsu' },
  { category: 'bogor', topic: 'Kota lain di luar Bogor', status: 'planned', notes: 'Belum ada local authority cluster untuk kota selain Bogor' },
]

export function getCoverageForCategory(category: KnowledgeCategorySlug): CoverageEntry[] {
  return COVERAGE_MATRIX.filter((entry) => entry.category === category)
}

export function getCoverageSummary(): Record<CoverageStatus, number> {
  return COVERAGE_MATRIX.reduce(
    (summary, entry) => {
      summary[entry.status] += 1
      return summary
    },
    { complete: 0, partial: 0, planned: 0 } as Record<CoverageStatus, number>
  )
}
