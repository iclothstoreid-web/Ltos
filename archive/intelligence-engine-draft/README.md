# Owner Intelligence Engine — Archived Draft

## Asal draft

Modul ini menamai dirinya sendiri "Owner Intelligence Engine (Sprint D.2)" di
komentar kode (`types.ts`, `insightGenerator.ts`). Tidak ada brief, dokumen,
atau commit "Sprint D.2" yang ditemukan di manapun di repository atau riwayat
git — draft ini kemungkinan ditulis mengikuti sebuah brief yang tidak pernah
tersimpan.

Secara desain, modul ini adalah lapisan derivasi read-only di atas sinyal
yang sudah ada (`get_owner_summary`/`get_sla_risk_orders` via
`src/lib/decision`, `getCommercialSummary`, `getMaterialAttentionList`) —
tujuannya menormalisasi tiga vocabulary prioritas yang berbeda-beda di
codebase (`Decision Center`'s severity, `BusinessPriority`, verdict estimasi)
menjadi satu skala `Priority` yang konsisten, lalu menyusunnya jadi
`Decision[]` / `OwnerInsightBoard` yang siap dirender UI.

## Alasan diarsipkan

- **0 caller** — dikonfirmasi lewat grep menyeluruh (path import maupun
  per-simbol untuk seluruh 18 export) di seluruh `src/`: tidak ada satu pun
  referensi ke modul ini dari kode lain.
- **Tidak pernah ter-commit** — `git log --all -- src/lib/intelligence/`
  kosong; draft ini murni working-tree, tidak pernah masuk histori git di
  branch atau stash manapun.
- **Brief sumbernya hilang** — "Sprint D.2" yang disebut di komentar tidak
  memiliki jejak apapun untuk diverifikasi kebutuhan aslinya.
- **Berpotensi duplikat konsep** — bentuk `Decision`/`priority`/`confidence`
  nyaris identik dengan sistem "Decision Cards" (`OperationalAlertCardData`,
  dkk. di `src/lib/decision/types.ts`, Sprint N.1), yang sendirinya sudah
  tidak dirender di `OwnerCommandCenter.tsx` saat ini (di-import di props
  tapi tidak pernah muncul di JSX).

## Status

- **Belum pernah digunakan** di production maupun development — tidak ada
  UI, page, atau modul lain yang pernah memanggilnya.
- **Tidak memiliki caller** — lihat bukti di atas.
- **Kualitas kode**: lengkap secara tipe, lolos `tsc --noEmit`, pure
  functions tanpa I/O langsung, mengikuti konvensi penulisan komentar
  codebase ini. Bukan kode setengah jadi — hanya belum pernah di-wire ke UI.
- File dipindahkan apa adanya dari `src/lib/intelligence/` ke
  `archive/intelligence-engine-draft/` tanpa perubahan isi.

## Kapan layak dipertimbangkan kembali

Pertimbangkan mengangkat draft ini kembali (pindahkan balik ke `src/lib/`)
jika:

1. Ada kebutuhan nyata untuk menyatukan tiga vocabulary prioritas yang
   berbeda-beda di codebase (lihat `priorityEngine.ts` untuk daftar
   lengkapnya) ke dalam satu tampilan/laporan.
2. `src/components/owner/decision-center/DecisionCenter.tsx` (Sprint I,
   halaman live saat ini yang paling dekat bentuknya) butuh direstrukturisasi
   menjadi satu board gabungan lintas-domain alih-alih 7 section terpisah
   seperti sekarang.
3. Sistem "Decision Cards" (`src/components/command-center/OwnerCommandCenter/DecisionCards/`)
   dihidupkan kembali dan butuh satu data source yang konsisten.

Sebelum melanjutkan implementasi, tulis ulang brief "Sprint D.2"-nya secara
eksplisit (tidak ditemukan versi aslinya) dan konfirmasi modul mana yang akan
menjadi caller pertama — jangan asumsikan target integrasinya dari draft ini
saja.
