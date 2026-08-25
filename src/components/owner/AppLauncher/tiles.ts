import type { LucideIcon } from 'lucide-react'
import { BarChart3, Boxes, LayoutDashboard, Route, Ruler, ScanLine, Sparkles, Users } from 'lucide-react'

export interface LauncherTileConfig {
  name: string
  description: string
  href: string
  icon: LucideIcon
  // Odoo App Launcher recreation (odoo.com/id_ID, directly inspected) — each
  // app there carries its own identity color inside a shared neutral icon
  // plate. LTOS can't use Odoo's saturated rainbow (Color DNA forbids
  // multi-color category systems), so this is a small, deliberately muted
  // "thread spool" palette instead: one deep, desaturated tone per module,
  // all drawn from hues already present in the codebase (Owner OS
  // primary/warm-gold, the public site's luxury-* Walnut Atelier browns)
  // plus loden green and two new muted tones (rust, slate) added
  // specifically for this per-module differentiation, kept in the same
  // deep/muted value range so the set reads as one coherent swatch card
  // rather than a bright icon-pack.
  color: string
}

// The 8 tiles from the App Launcher brief, mapped to the routes that
// genuinely exist today (verified against src/middleware.ts's ROUTE_RULES
// and each destination page/layout — no new pages were created for this).
//
// Customer, Design Studio, and Fitter all resolve to the same URL
// (/workspace/check-in) on purpose: Design Studio and Measurement only ever
// exist at a [consultationId]-scoped route (src/app/workspace/design-studio/
// [consultationId]/page.tsx, src/app/workspace/measurement/[consultationId]
// /page.tsx) — Check-In's customer-search view is the one real front door
// into either. Kept as 3 distinct tiles (not merged) per product decision,
// differentiated by name/icon/description/color only.
//
// Production points at /production as-is — that route is QR-scan-only
// ("no order list here" per its own file header), so the description says
// exactly that rather than implying a browsable order list.
//
// Customer Journey points at /owner/communications — the closest real match
// for progress/updates/delivery (per-order production stage + customer
// messages); there is no dedicated internal "journey" page today.
export const LAUNCHER_TILES: LauncherTileConfig[] = [
  {
    name: 'Command Center',
    description: 'KPI, bottleneck, agenda, keputusan hari ini',
    href: '/command-center',
    icon: LayoutDashboard,
    color: '#0B1628', // Midnight Navy — existing Owner OS primary
  },
  {
    name: 'Customer',
    description: 'Cari pelanggan, riwayat konsultasi',
    href: '/workspace/check-in',
    icon: Users,
    color: '#A15C38', // muted terracotta
  },
  {
    name: 'Design Studio',
    description: 'Mulai dari pelanggan untuk membuka desain',
    href: '/workspace/check-in',
    icon: Sparkles,
    color: '#B98900', // Brass — existing Owner OS amber-mid
  },
  {
    name: 'Fitter',
    description: 'Check-in, ukur, profil tubuh',
    href: '/workspace/check-in',
    icon: Ruler,
    color: '#005645', // Deep Forest / Loden Green
  },
  {
    name: 'Inventory',
    description: 'Material, stok, pergerakan',
    href: '/inventory',
    icon: Boxes,
    color: '#6A4A34', // Walnut Brown — existing luxury-navy value
  },
  {
    name: 'Production',
    description: 'Pindai order untuk membuka paket produksi',
    href: '/production',
    icon: ScanLine,
    color: '#221814', // Deep Espresso — existing luxury-black value
  },
  {
    name: 'Customer Journey',
    description: 'Progres pesanan & komunikasi pelanggan',
    href: '/owner/communications',
    icon: Route,
    color: '#3E5568', // muted dusty slate blue
  },
  {
    name: 'Analytics',
    description: 'Performa, funnel, wawasan bisnis',
    href: '/owner/analytics',
    icon: BarChart3,
    color: '#7A3540', // muted deep wine
  },
]
