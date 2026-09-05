import type { LucideIcon } from 'lucide-react'
import { BarChart3, Bot, Boxes, LayoutDashboard, Newspaper, Route, Ruler, ScanLine, Sparkles, Users } from 'lucide-react'

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

// Owner OS launcher tiles mapped only to routes that genuinely exist.
export const LAUNCHER_TILES: LauncherTileConfig[] = [
  {
    name: 'Command Center',
    description: 'KPI, bottleneck, agenda, keputusan hari ini',
    href: '/command-center',
    icon: LayoutDashboard,
    color: '#0B1628',
  },
  {
    name: 'Customer',
    description: 'Cari pelanggan, riwayat konsultasi',
    href: '/workspace/check-in',
    icon: Users,
    color: '#A15C38',
  },
  {
    name: 'AI Sales',
    description: 'WhatsApp, lead, closing, human handoff',
    href: '/owner/ai-sales',
    icon: Bot,
    color: '#284B43',
  },
  {
    name: 'Design Studio',
    description: 'Mulai dari pelanggan untuk membuka desain',
    href: '/workspace/check-in',
    icon: Sparkles,
    color: '#B98900',
  },
  {
    name: 'Fitter',
    description: 'Check-in, ukur, profil tubuh',
    href: '/workspace/check-in',
    icon: Ruler,
    color: '#005645',
  },
  {
    name: 'Inventory',
    description: 'Material, stok, pergerakan',
    href: '/inventory',
    icon: Boxes,
    color: '#6A4A34',
  },
  {
    name: 'Production',
    description: 'Pindai order untuk membuka paket produksi',
    href: '/production',
    icon: ScanLine,
    color: '#221814',
  },
  {
    name: 'Customer Journey',
    description: 'Progres pesanan & komunikasi pelanggan',
    href: '/owner/communications',
    icon: Route,
    color: '#3E5568',
  },
  {
    name: 'Analytics',
    description: 'Performa, funnel, wawasan bisnis',
    href: '/owner/analytics',
    icon: BarChart3,
    color: '#7A3540',
  },
  {
    name: 'Content',
    description: 'Media, artikel Journal, galeri, gambar homepage',
    href: '/owner/content',
    icon: Newspaper,
    color: '#4A5C3A',
  },
]
