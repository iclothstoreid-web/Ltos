'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  createJournalArticle,
  updateJournalArticle,
  deleteJournalArticle,
  slugify,
  type JournalArticleRow,
  type JournalArticleInput,
} from '@/lib/content/journalArticles'
import type { WebsiteMedia } from '@/lib/content/websiteMedia'
import { ContentShell, PrimaryButton, GhostButton, Field, inputClass, StatusPill, MediaThumb } from './contentUi'
import { MediaPicker } from './MediaPicker'
import { FABRIC_SITE_ORIGIN } from '@/lib/materials/seo'

export function ArticlesManager({
  initialArticles,
  initialMedia,
}: {
  initialArticles: JournalArticleRow[]
  initialMedia: WebsiteMedia[]
}) {
  const [supabase] = useState(() => createClient())
  const [articles, setArticles] = useState(initialArticles)
  const [media, setMedia] = useState(initialMedia)
  const [editing, setEditing] = useState<JournalArticleRow | 'new' | null>(null)

  async function onSave(input: JournalArticleInput, existing: JournalArticleRow | null) {
    if (existing) {
      const row = await updateJournalArticle(supabase, existing.id, input, { wasPublished: existing.status === 'published' })
      setArticles((prev) => prev.map((a) => (a.id === row.id ? row : a)))
    } else {
      const row = await createJournalArticle(supabase, input)
      setArticles((prev) => [row, ...prev])
    }
    setEditing(null)
  }

  async function onDelete(id: string) {
    await deleteJournalArticle(supabase, id)
    setArticles((prev) => prev.filter((a) => a.id !== id))
    setEditing(null)
  }

  return (
    <ContentShell
      title="Articles / Journal"
      actions={
        <PrimaryButton onClick={() => setEditing('new')}>
          <span className="material-symbols-outlined text-[18px]">add</span> Artikel Baru
        </PrimaryButton>
      }
    >
      <ul className="divide-y divide-[#c4c7c7] rounded-xl border border-[#c4c7c7] bg-white">
        {articles.map((a) => {
          const cover = a.cover_media_id ? media.find((m) => m.id === a.cover_media_id) : null
          return (
            <li key={a.id}>
              <button onClick={() => setEditing(a)} className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-[#151c27]/[0.03]">
                <MediaThumb path={cover?.storage_path ?? null} alt={cover?.alt_text} size={56} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-medium text-[#151c27]">{a.title || '(tanpa judul)'}</p>
                  <p className="truncate font-sans text-xs text-[#444748]">/journal/{a.slug}</p>
                </div>
                <StatusPill status={a.status} />
              </button>
            </li>
          )
        })}
        {articles.length === 0 && <li className="p-8 text-center font-sans text-sm text-[#444748]">Belum ada artikel.</li>}
      </ul>

      {editing && (
        <ArticleEditor
          key={editing === 'new' ? 'new' : editing.id}
          article={editing === 'new' ? null : editing}
          media={media}
          onClose={() => setEditing(null)}
          onSave={(input) => onSave(input, editing === 'new' ? null : editing)}
          onDelete={editing === 'new' ? undefined : () => onDelete(editing.id)}
          onMediaUploaded={(m) => setMedia((prev) => [m, ...prev])}
          existingSlugs={articles.filter((a) => editing === 'new' || a.id !== editing.id).map((a) => a.slug)}
        />
      )}
    </ContentShell>
  )
}

function ArticleEditor({
  article,
  media,
  onClose,
  onSave,
  onDelete,
  onMediaUploaded,
  existingSlugs,
}: {
  article: JournalArticleRow | null
  media: WebsiteMedia[]
  onClose: () => void
  onSave: (input: JournalArticleInput) => Promise<void>
  onDelete?: () => Promise<void>
  onMediaUploaded: (m: WebsiteMedia) => void
  existingSlugs: string[]
}) {
  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!article)
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
  const [body, setBody] = useState(article?.body ?? '')
  const [tags, setTags] = useState((article?.tags ?? []).join(', '))
  const [author, setAuthor] = useState(article?.author ?? 'Local Tailor')
  const [seoTitle, setSeoTitle] = useState(article?.seo_title ?? '')
  const [metaDesc, setMetaDesc] = useState(article?.meta_description ?? '')
  const [canonical, setCanonical] = useState(article?.canonical_url ?? '')
  const [coverId, setCoverId] = useState<string | null>(article?.cover_media_id ?? null)
  const [ogId, setOgId] = useState<string | null>(article?.og_media_id ?? null)
  const [picking, setPicking] = useState<'cover' | 'og' | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [localMedia, setLocalMedia] = useState(media)

  const effectiveSlug = slugify(slug || title)
  const slugClash = existingSlugs.includes(effectiveSlug)
  const cover = coverId ? localMedia.find((m) => m.id === coverId) : null
  const og = ogId ? localMedia.find((m) => m.id === ogId) : null

  async function submit(status: 'draft' | 'published') {
    setErr(null)
    if (!title.trim()) return setErr('Judul wajib.')
    if (!effectiveSlug) return setErr('Slug tidak valid.')
    if (slugClash) return setErr('Slug sudah dipakai artikel lain.')
    if (status === 'published' && !excerpt.trim()) return setErr('Excerpt wajib untuk publish.')
    setBusy(true)
    try {
      await onSave({
        title,
        slug: effectiveSlug,
        excerpt,
        body,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        author,
        status,
        seo_title: seoTitle || null,
        meta_description: metaDesc || null,
        canonical_url: canonical || null,
        cover_media_id: coverId,
        og_media_id: ogId,
      })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal menyimpan.')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-center overflow-y-auto bg-black/40 p-3 sm:p-6" onClick={onClose}>
      <div className="my-auto w-full max-w-3xl rounded-2xl bg-[#f9f9ff] p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sans text-base font-medium text-[#151c27]">{article ? 'Edit Artikel' : 'Artikel Baru'}</h2>
          <div className="flex items-center gap-2">
            {article && <StatusPill status={article.status} />}
            <button onClick={onClose} aria-label="Tutup" className="flex h-8 w-8 items-center justify-center rounded-full text-[#444748] hover:bg-[#151c27]/5">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 sm:col-span-2">
            <Field label="Judul">
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)) }}
                className={inputClass}
              />
            </Field>
            <Field label="Slug" hint={`URL: /journal/${effectiveSlug || '…'}`}>
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
                className={`${inputClass} ${slugClash ? 'border-[#ba1a1a]' : ''}`}
              />
            </Field>
            <Field label="Excerpt" hint="Ringkasan 1–2 kalimat, tampil di daftar Journal & meta description default.">
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputClass} />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Body" hint="Markdown ringan: ## Heading, ### Sub, - list, 1. list, > kutipan, **tebal**, *miring*, [teks](/atau-https-url).">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} className={`${inputClass} font-mono text-xs`} />
            </Field>
          </div>

          <MediaSlot label="Cover Image" media={cover} onPick={() => setPicking('cover')} onClear={() => setCoverId(null)} />
          <MediaSlot label="OG Image (opsional)" media={og} onPick={() => setPicking('og')} onClear={() => setOgId(null)} />

          <Field label="Tags (pisah koma)"><input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} /></Field>
          <Field label="Author"><input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} /></Field>

          <Field label="SEO Title (opsional)"><input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputClass} /></Field>
          <Field label="Meta Description (opsional)"><input value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} className={inputClass} /></Field>
          <Field label="Canonical URL (opsional)" hint={`Default: ${FABRIC_SITE_ORIGIN}/journal/${effectiveSlug || '…'}`}>
            <input value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder={`${FABRIC_SITE_ORIGIN}/journal/${effectiveSlug}`} className={inputClass} />
          </Field>
        </div>

        {err && <p className="mt-3 font-sans text-sm text-[#ba1a1a]">{err}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#c4c7c7] pt-4">
          <PrimaryButton onClick={() => submit('published')} disabled={busy}>
            {article?.status === 'published' ? 'Simpan (Published)' : 'Publish'}
          </PrimaryButton>
          <GhostButton onClick={() => submit('draft')} disabled={busy}>
            {article?.status === 'published' ? 'Unpublish → Draft' : 'Simpan Draft'}
          </GhostButton>
          {onDelete && (
            <button
              onClick={() => onDelete()}
              disabled={busy}
              className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-2 font-sans text-sm text-[#ba1a1a] transition hover:bg-[#ba1a1a]/10 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span> Hapus
            </button>
          )}
        </div>

        {picking && (
          <MediaPicker
            media={localMedia}
            defaultCategory="journal"
            title={picking === 'cover' ? 'Pilih Cover' : 'Pilih OG Image'}
            onClose={() => setPicking(null)}
            onPicked={(m) => { picking === 'cover' ? setCoverId(m.id) : setOgId(m.id); setPicking(null) }}
            onUploaded={(m) => { setLocalMedia((prev) => [m, ...prev]); onMediaUploaded(m) }}
          />
        )}
      </div>
    </div>
  )
}

function MediaSlot({
  label,
  media,
  onPick,
  onClear,
}: {
  label: string
  media: WebsiteMedia | null | undefined
  onPick: () => void
  onClear: () => void
}) {
  return (
    <div>
      <span className="mb-1 block font-sans text-xs font-medium uppercase tracking-[0.06em] text-[#444748]">{label}</span>
      <div className="flex items-center gap-3 rounded-lg border border-[#c4c7c7] bg-white p-2">
        <MediaThumb path={media?.storage_path ?? null} alt={media?.alt_text} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-xs text-[#151c27]">{media ? media.title : 'Belum dipilih'}</p>
          <div className="mt-1 flex gap-2">
            <button onClick={onPick} className="font-sans text-xs text-[#755b00] hover:underline">
              {media ? 'Ganti' : 'Pilih'}
            </button>
            {media && (
              <button onClick={onClear} className="font-sans text-xs text-[#ba1a1a] hover:underline">
                Lepas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
