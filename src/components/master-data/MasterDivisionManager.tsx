'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { MasterDivision } from '@/lib/divisions/types'
import {
  createDivision,
  listAllDivisions,
  setDivisionActive,
  swapDivisionOrder,
  updateDivision,
} from '@/lib/divisions/client'

interface MasterDivisionManagerProps {
  initialDivisions: MasterDivision[]
}

// Master Division admin — the divisi picklist (previously hardcoded as
// OPERATOR_DIVISI_OPTIONS in stageConfig.ts, now removed) is real master
// data. Tambah/Ubah/Nonaktifkan (soft delete only, never hard)/Atur urutan,
// same CRUD shape as Operator Management (src/components/operators/OperatorManager.tsx).
export function MasterDivisionManager({ initialDivisions }: MasterDivisionManagerProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [divisions, setDivisions] = useState(initialDivisions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function refresh() {
    setLoading(true)
    try {
      setDivisions(await listAllDivisions(supabase))
    } catch (err) {
      console.error('[master-division] refresh failed', err)
      setError('Gagal memuat data divisi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    try {
      await createDivision(supabase, newName)
      setNewName('')
      await refresh()
    } catch (err) {
      console.error('[master-division] create failed', err)
      setError('Gagal menambah divisi.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(d: MasterDivision) {
    setEditingId(d.id)
    setEditName(d.name)
  }

  async function handleSaveEdit() {
    if (!editingId) return
    setLoading(true)
    setError(null)
    try {
      await updateDivision(supabase, editingId, editName)
      setEditingId(null)
      await refresh()
    } catch (err) {
      console.error('[master-division] update failed', err)
      setError('Gagal mengubah divisi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(d: MasterDivision) {
    setLoading(true)
    setError(null)
    try {
      await setDivisionActive(supabase, d.id, !d.is_active)
      await refresh()
    } catch (err) {
      console.error('[master-division] toggle active failed', err)
      setError('Gagal mengubah status divisi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= divisions.length) return
    setLoading(true)
    setError(null)
    try {
      await swapDivisionOrder(supabase, divisions[index].id, divisions[target].id)
      await refresh()
    } catch (err) {
      console.error('[master-division] reorder failed', err)
      setError('Gagal mengubah urutan divisi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Master Division</h1>
          <p className="text-xs text-[#444748]">Sumber tunggal daftar Divisi untuk semua dropdown operator</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/owner/master-data-center')}
          className="text-xs uppercase tracking-widest text-[#755b00] hover:underline"
        >
          Kembali
        </button>
      </header>

      <main className="px-4 sm:px-8 lg:px-16 py-8 max-w-2xl mx-auto space-y-8">
        {error && (
          <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded text-sm text-[#ba1a1a]">
            {error}
          </div>
        )}

        <section className="bg-white border-[0.5px] border-[#c4c7c7] p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#444748] font-bold">Tambah Divisi</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nama divisi"
              className="flex-1 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
            >
              {creating ? 'Menambah...' : 'Tambah'}
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#444748] font-bold">
            Daftar Divisi {loading && '· Memuat...'}
          </h2>
          {divisions.length === 0 && <p className="text-sm text-[#444748]">Belum ada divisi.</p>}
          {divisions.map((d, index) => (
            <div key={d.id} className="bg-white border-[0.5px] border-[#c4c7c7] p-4">
              {editingId === d.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="py-2 px-4 border border-[#c4c7c7] text-xs uppercase tracking-widest"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      aria-label="Naikkan urutan"
                      className="p-1 text-[#46464c] disabled:opacity-20 hover:text-[#161b29]"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === divisions.length - 1}
                      aria-label="Turunkan urutan"
                      className="p-1 text-[#46464c] disabled:opacity-20 hover:text-[#161b29]"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="font-hanken text-sm font-semibold">{d.name}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest ${
                        d.is_active ? 'bg-[#dff2df] text-[#1f6b2c]' : 'bg-[#f3d8d8] text-[#a33]'
                      }`}
                    >
                      {d.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(d)}
                      className="text-xs text-[#755b00] hover:underline"
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(d)}
                      className="text-xs text-[#ba1a1a] hover:underline"
                    >
                      {d.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
