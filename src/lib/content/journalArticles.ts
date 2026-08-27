import type { SupabaseClient } from '@supabase/supabase-js'

// DB-backed Journal (new). The separate /knowledge cluster stays hardcoded
// TS on purpose — it is SEO-critical and out of scope. Public reads go
// through the SECURITY DEFINER RPCs (published-only); staff CRUD hits the
// table directly under RLS.

export interface JournalArticleRow {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_media_id: string | null
  body: string
  category: string
  tags: string[]
  author: string
  status: 'draft' | 'published'
  seo_title: string | null
  meta_description: string | null
  og_media_id: string | null
  canonical_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

// Shape returned by the public RPCs (Storage paths, not URLs).
export interface PublicJournalListItem {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  author: string
  published_at: string | null
  cover_path: string | null
}

export interface PublicJournalArticle extends PublicJournalListItem {
  body: string
  updated_at: string
  seo_title: string | null
  meta_description: string | null
  canonical_url: string | null
  cover_alt: string | null
  og_path: string | null
}

// ---- public (anon-safe) ----

export async function fetchPublishedJournalArticles(supabase: SupabaseClient): Promise<PublicJournalListItem[]> {
  const { data, error } = await supabase.rpc('list_published_journal_articles')
  if (error) throw error
  return (data ?? []) as PublicJournalListItem[]
}

export async function fetchPublishedJournalArticle(
  supabase: SupabaseClient,
  slug: string
): Promise<PublicJournalArticle | null> {
  const { data, error } = await supabase.rpc('get_published_journal_article', { p_slug: slug })
  if (error) throw error
  const row = (data ?? [])[0]
  return (row as PublicJournalArticle) ?? null
}

// ---- staff CRUD (RLS-gated) ----

export async function fetchAllJournalArticles(supabase: SupabaseClient): Promise<JournalArticleRow[]> {
  const { data, error } = await supabase
    .from('journal_articles')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as JournalArticleRow[]
}

export async function fetchJournalArticle(supabase: SupabaseClient, id: string): Promise<JournalArticleRow | null> {
  const { data, error } = await supabase.from('journal_articles').select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as JournalArticleRow
}

export type JournalArticleInput = Partial<
  Pick<
    JournalArticleRow,
    | 'slug' | 'title' | 'excerpt' | 'cover_media_id' | 'body' | 'category' | 'tags'
    | 'author' | 'status' | 'seo_title' | 'meta_description' | 'og_media_id' | 'canonical_url'
  >
>

export async function createJournalArticle(
  supabase: SupabaseClient,
  input: JournalArticleInput
): Promise<JournalArticleRow> {
  const published = input.status === 'published'
  const { data, error } = await supabase
    .from('journal_articles')
    .insert({
      ...normalize(input),
      published_at: published ? new Date().toISOString() : null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as JournalArticleRow
}

export async function updateJournalArticle(
  supabase: SupabaseClient,
  id: string,
  input: JournalArticleInput,
  opts: { wasPublished: boolean }
): Promise<JournalArticleRow> {
  const patch: Record<string, unknown> = { ...normalize(input), updated_at: new Date().toISOString() }
  // published_at is stamped on the draft->published transition and cleared
  // on unpublish; an edit to an already-published article keeps its date.
  if (input.status === 'published' && !opts.wasPublished) patch.published_at = new Date().toISOString()
  if (input.status === 'draft' && opts.wasPublished) patch.published_at = null
  const { data, error } = await supabase.from('journal_articles').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data as JournalArticleRow
}

export async function deleteJournalArticle(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('journal_articles').delete().eq('id', id)
  if (error) throw error
}

function normalize(input: JournalArticleInput): JournalArticleInput {
  const out: JournalArticleInput = { ...input }
  if (typeof out.slug === 'string') out.slug = slugify(out.slug)
  if (typeof out.title === 'string') out.title = out.title.trim()
  for (const k of ['excerpt', 'seo_title', 'meta_description', 'canonical_url', 'author'] as const) {
    if (typeof out[k] === 'string') out[k] = (out[k] as string).trim() || (k === 'author' ? 'Local Tailor' : '')
  }
  return out
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
