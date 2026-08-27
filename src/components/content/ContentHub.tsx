'use client'

import Link from 'next/link'
import { ContentShell } from './contentUi'

const CARDS = [
  {
    href: '/owner/content/media',
    icon: 'perm_media',
    label: 'Media Library',
    description: 'Upload & kelola semua gambar website — alt text, kategori, arsip.',
  },
  {
    href: '/owner/content/articles',
    icon: 'article',
    label: 'Articles / Journal',
    description: 'Tulis, edit, publish/unpublish artikel Journal. Draft tidak tampil publik.',
  },
  {
    href: '/owner/content/gallery',
    icon: 'collections',
    label: 'Gallery',
    description: 'Pilih gambar dari Media Library, atur urutan, tandai featured, publish.',
  },
  {
    href: '/owner/content/homepage',
    icon: 'home',
    label: 'Homepage Content',
    description: 'Ganti gambar per section homepage tanpa deploy — slot fallback ke asset lama.',
  },
]

export function ContentHub() {
  return (
    <ContentShell title="Content & Media" backHref="/owner">
      <p className="mb-6 max-w-2xl font-sans text-sm text-[#444748]">
        Kelola konten & media website publik Local Tailor. Perubahan langsung tampil di localtailor.id
        (published only) tanpa perlu edit source code.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex gap-4 rounded-2xl border border-[#c4c7c7] bg-white p-5 transition hover:border-[#755b00]/50 hover:shadow-sm"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#755b00]/10 text-[#755b00]">
              <span className="material-symbols-outlined">{c.icon}</span>
            </span>
            <span className="min-w-0">
              <span className="block font-sans text-base font-medium text-[#151c27]">{c.label}</span>
              <span className="mt-1 block font-sans text-sm text-[#444748]">{c.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </ContentShell>
  )
}
