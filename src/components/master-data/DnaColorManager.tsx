'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DnaColor, DnaColorInput, DnaColorStatus } from '@/lib/design/dnaColors'
import { createDnaColor, fetchDnaColors, updateDnaColor, archiveDnaColor } from '@/lib/design/dnaColors'

interface DnaColorManagerProps {
  initialColors: DnaColor[]
}

const STATUS_LABEL: Record<DnaColorStatus, string> = {
  draft: 'Draft',
  active: 'Aktif',
  archived: 'Archived',
}

const STATUS_TONE: Record<DnaColorStatus, string> = {
  draft: 'text-[#444748] bg-[#444748]/10',
  active: 'text-[#2e7d32] bg-[#2e7d32]/10',
  archived: 'text-[#c0392b] bg-[#c0392b]/10',
}

interface EditForm {
  name: string
  family: string
  character: string
  prompt: string
  reference_image: string
  rgb: string
  hex: string
  lab: string
  hsv: string
  version: string
  status: DnaColorStatus
}

const EMPTY_FORM: EditForm = {
  name: '',
  family: '',
  character: '',
  prompt: '',
  reference_image: '',
  rgb: '',
  hex: '#775a19',
  lab: '',
  hsv: '',
  version: '1',
  status: 'draft',
}

function toDnaColorInput(form: EditForm): DnaColorInput {
  return {
    name: form.name,
    family: form.family.trim() || null,
    character: form.character.trim() || null,
    prompt: form.prompt.trim() || null,
    reference_image: form.reference_image.trim() || null,
    rgb: form.rgb.trim() || null,
    hex: form.hex.trim() || null,
    lab: form.lab.trim() || null,
    hsv: form.hsv.trim() || null,
    version: Number(form.version) || 1,
    status: form.status,
  }
}

// DNA Color Repository admin — the ONLY place a DNA Color may be
// created/edited, per the Architecture Lock ("DNA hanya dibuat dari menu
// DNA Color"). Material Master (/owner/material-master) only ever picks
// from `fetchActiveDnaColors` when mapping a Material Color, never creates
// one. Same Tambah/Ubah/Nonaktifkan (here: Archive) shape as
// MasterDataManager, but this is a genuinely separate table/component —
// dna_colors has no `category`, no selling_points/internal_notes, and its
// own status lifecycle (draft/active/archived) instead of is_active.
export function DnaColorManager({ initialColors }: DnaColorManagerProps) {
  const router = useRouter()
  const supabase = createClient()

  const [colors, setColors] = useState(initialColors)
  const [newName, setNewName] = useState('')
  const [newHex, setNewHex] = useState('#775a19')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EditForm>(EMPTY_FORM)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)

  async function refresh() {
    try {
      setColors(await fetchDnaColors(supabase))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat DNA Color.')
    }
  }

  function startEdit(color: DnaColor) {
    setEditingId(color.id)
    setForm({
      name: color.name,
      family: color.family ?? '',
      character: color.character ?? '',
      prompt: color.prompt ?? '',
      reference_image: color.reference_image ?? '',
      rgb: color.rgb ?? '',
      hex: color.hex ?? '#775a19',
      lab: color.lab ?? '',
      hsv: color.hsv ?? '',
      version: String(color.version),
      status: color.status,
    })
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const created = await createDnaColor(supabase, { name: newName, hex: newHex })
      setNewName('')
      setNewHex('#775a19')
      await refresh()
      startEdit(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah DNA Color.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit() {
    if (!editingId || !form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await updateDnaColor(supabase, editingId, toDnaColorInput(form))
      setEditingId(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan DNA Color.')
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive(id: string) {
    setSaving(true)
    setError(null)
    try {
      await archiveDnaColor(supabase, id)
      if (editingId === id) setEditingId(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal meng-archive DNA Color.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-caslon text-2xl">DNA Color Repository</h1>
          <p className="text-sm text-[#444748] mt-1">
            AI Knowledge Repository — single source of truth untuk warna, dipakai Render Engine.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs uppercase tracking-widest text-[#444748] hover:text-[#151c27] transition-colors"
        >
          Kembali
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 lg:px-16 py-12">
        {error && (
          <div className="mb-6 bg-[#fdecea] border-[0.5px] border-[#c0392b] p-3">
            <p className="text-xs text-[#c0392b]">{error}</p>
          </div>
        )}

        <div className="bg-white border-[0.5px] border-[#c4c7c7]/40 mb-8">
          {colors.length === 0 && <p className="p-6 text-sm text-[#444748]">Belum ada DNA Color.</p>}
          {colors.map(color =>
            editingId === color.id ? (
              <div key={color.id} className="px-6 py-6 border-b border-[#c4c7c7]/20 last:border-b-0 space-y-4">
                <div className="flex flex-wrap items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-full border border-[#c4c7c7] shrink-0"
                    style={{ backgroundColor: form.hex || '#c4c7c7' }}
                  />
                  <div className="flex-1 min-w-[200px] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Nama</p>
                      <input
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border-b border-[#775a19] bg-transparent py-1 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Family</p>
                      <input
                        value={form.family}
                        onChange={e => setForm(f => ({ ...f, family: e.target.value }))}
                        placeholder="mis. blue-navy"
                        className="w-full border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                      />
                    </div>
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Hex</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.hex || '#775a19'}
                          onChange={e => setForm(f => ({ ...f, hex: e.target.value }))}
                          className="w-8 h-8 border-none p-0"
                        />
                        <input
                          value={form.hex}
                          onChange={e => setForm(f => ({ ...f, hex: e.target.value }))}
                          className="flex-1 border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Status</p>
                      <select
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value as DnaColorStatus }))}
                        className="w-full border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                      >
                        {(Object.keys(STATUS_LABEL) as DnaColorStatus[]).map(status => (
                          <option key={status} value={status}>
                            {STATUS_LABEL[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">RGB</p>
                      <input
                        value={form.rgb}
                        onChange={e => setForm(f => ({ ...f, rgb: e.target.value }))}
                        placeholder="mis. 0, 0, 128"
                        className="w-full border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                      />
                    </div>
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">LAB</p>
                      <input
                        value={form.lab}
                        onChange={e => setForm(f => ({ ...f, lab: e.target.value }))}
                        className="w-full border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                      />
                    </div>
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">HSV</p>
                      <input
                        value={form.hsv}
                        onChange={e => setForm(f => ({ ...f, hsv: e.target.value }))}
                        className="w-full border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                      />
                    </div>
                    <div>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Version</p>
                      <input
                        type="number"
                        min="1"
                        value={form.version}
                        onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                        className="w-full border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">
                        Reference Image (URL)
                      </p>
                      <input
                        value={form.reference_image}
                        onChange={e => setForm(f => ({ ...f, reference_image: e.target.value }))}
                        placeholder="https://..."
                        className="w-full border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">
                        Character
                      </p>
                      <input
                        value={form.character}
                        onChange={e => setForm(f => ({ ...f, character: e.target.value }))}
                        placeholder="mis. Deep, formal, understated"
                        className="w-full border-b border-[#c4c7c7] bg-transparent py-1 text-sm outline-none focus:border-[#775a19]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <p className="font-sans text-[10px] uppercase tracking-widest text-[#444748] mb-2">Prompt</p>
                      <textarea
                        value={form.prompt}
                        onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                        rows={3}
                        placeholder="Teks yang dikirim ke Render Engine untuk mendeskripsikan warna ini"
                        className="w-full border-[0.5px] border-[#c4c7c7] bg-transparent p-2 text-sm outline-none focus:border-[#775a19]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveEdit}
                    className="px-6 py-2 bg-[#151c27] text-white text-xs uppercase tracking-widest hover:bg-[#775a19] transition-colors disabled:opacity-40"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-xs uppercase tracking-widest text-[#444748] hover:underline"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={color.id}
                className="flex flex-wrap items-center gap-4 px-6 py-4 border-b border-[#c4c7c7]/20 last:border-b-0"
              >
                <div
                  className="w-8 h-8 rounded-full border border-[#c4c7c7] shrink-0"
                  style={{ backgroundColor: color.hex || '#c4c7c7' }}
                />
                <div className="flex-1 min-w-[100px]">
                  <span className="text-sm">{color.name}</span>
                  {color.family && <p className="text-[11px] text-[#444748]/70">{color.family}</p>}
                </div>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${STATUS_TONE[color.status]}`}>
                  {STATUS_LABEL[color.status]}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(color)}
                  className="text-xs uppercase tracking-widest text-[#444748] hover:text-[#151c27] transition-colors"
                >
                  Ubah
                </button>
                {color.status !== 'archived' && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleArchive(color.id)}
                    className="text-xs uppercase tracking-widest text-[#c0392b] hover:underline disabled:opacity-50"
                  >
                    Archive
                  </button>
                )}
              </div>
            )
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={nameInputRef}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Tambah DNA Color baru (Nama)"
            className="flex-1 min-w-[200px] border-b border-[#c4c7c7] bg-transparent py-2 text-sm outline-none focus:border-[#775a19]"
          />
          <input
            type="color"
            value={newHex}
            onChange={e => setNewHex(e.target.value)}
            className="w-8 h-8 border-none p-0"
          />
          <button
            type="button"
            disabled={saving || !newName.trim()}
            onClick={handleAdd}
            className="px-6 py-2 bg-[#151c27] text-white text-xs uppercase tracking-widest hover:bg-[#775a19] transition-colors disabled:opacity-40"
          >
            Tambah
          </button>
        </div>
      </main>
    </div>
  )
}
