import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inventory Hub | Local Tailor',
  description: 'Material, inventory, stock, and estimation management.',
  applicationName: 'Inventory Hub',
  openGraph: {
    title: 'Inventory Hub',
    description: 'Material, inventory, stock, and estimation management.',
  },
}

export default function InventoryMaterialLayout({ children }: { children: React.ReactNode }) {
  return children
}
