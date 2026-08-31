'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Operator, OperatorStatus } from '@/lib/production/types'
import type { MasterDivision } from '@/lib/divisions/types'
import { OPERATOR_STATUS_LABELS, OPERATOR_STATUS_OPTIONS } from '@/lib/operators/types'
import { createOperator, listAllOperators, setOperatorStatus, softDeleteOperator, updateOperator } from '@/lib/operators/client'

interface OperatorManagerProps {
  initialOperators: Operator[]
  initialDivisions: MasterDivision[]
}

const STATUS_BADGE: Record<OperatorStatus, string> = {
  aktif: 'bg-[#dff2df] text-[#1f6b2c]',
  libur: 'bg-[#f3ecd8] text-[#755b00]',
  cuti: 'bg-[#f3ecd8] text-[#755b00]',
  nonaktif: 'bg-[#f3d8d8] text-[#a33]',
}

// Raw Postgres / PostgREST internals we don't want to surface verbatim to
// the user — fall back to the friendly message instead. A `raise exception`
// from one of the operator RPCs (plain Indonesian sentences like "Hanya
// Admin/Owner...") passes straight through.
function safeDbError(err: unknown, fallback: string): string {
  const raw =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message).trim()
      : ''
  if (!raw) return fallback
  if (/constraint|violates|duplicate key|syntax|relation|does not exist|permission denied|null value/i.test(raw)) {
    return fallback
  }
  return raw
}

// Sprint K Operator Management — CRUD + status (Aktif/Libur/Cuti/Nonaktif) +
// soft delete. Every write here goes through the RPC surface in
// supabase/migrations/20260804000000_add_operator_management.sql (later
// reshaped to division_id in 20260810000000), which keeps
// production_operators.is_active in sync via trigger — so marking someone
// Libur/Cuti/Nonaktif here automatically removes them from every existing
// capacity/KPI/picker query without touching that code.
//
// Operator identity is production_operators.id (uuid), never the name —
// 20260904000000 dropped the legacy UNIQUE(nama) constraint, so two
// operators may share a name across different divisions ("Deka — Persiapan
// Material" / "Deka — Cutting"). Divisi is chosen from master_divisions
// (get_active_divisions), the single source of truth for every divisi
// picklist in the app.
export function OperatorManager({ initialOperators, initialDivisions }: OperatorManagerProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [operators, setOperators] = useState(initialOperators)
  const [divisions] = useState(initialDivisions)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newNama, setNewNama] = useState('')
  const [newDivisionId, setNewDivisionId] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNama, setEditNama] = useState('')
  const [editDivisionId, setEditDivisionId] = useState<string>('')

  async function refresh() {
    setLoading(true)
    try {
      setOperators(await listAllOperators(supabase))
    } catch (err) {
      console.error('[operators] refresh failed', err)
      setError('Gagal memuat data operator.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    const nama = newNama.trim()
    if (!nama) {
      setError('Nama operator wajib diisi')
      return
    }
    if (!newDivisionId) {
      setError('Pilih divisi terlebih dahulu')
      return
    }
    setCreating(true)
    setError(null)
    try {
      await createOperator(supabase, nama, newDivisionId)
      setNewNama('')
      setNewDivisionId('')
      await refresh()
    } catch (err) {
      console.error('[operators] create failed', err)
      setError(safeDbError(err, 'Gagal menambah operator.'))
    } finally {
      setCreating(false)
    }
  }

  function startEdit(op: Operator) {
    setError(null)
    setEditingId(op.id)
    setEditNama(op.nama)
    setEditDivisionId(op.division_id ?? '')
  }

  async function handleSaveEdit() {
    if (!editingId) return
    const nama = editNama.trim()
    if (!nama) {
      setError('Nama operator wajib diisi')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await updateOperator(supabase, editingId, nama, editDivisionId || null)
      setEditingId(null)
      await refresh()
    } catch (err) {
      console.error('[operators] update failed', err)
      setError(safeDbError(err, 'Gagal mengubah operator.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(operatorId: string, status: OperatorStatus) {
    setLoading(true)
    setError(null)
    try {
      await setOperatorStatus(supabase, operatorId, status)
      await refresh()
    } catch (err) {
      console.error('[operators] status change failed', err)
      setError(safeDbError(err, 'Gagal mengubah status operator.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(operatorId: string) {
    if (!confirm('Hapus operator ini? Data riwayat pekerjaan tetap tersimpan (soft delete).')) return
    setLoading(true)
    setError(null)
    try {
      await softDeleteOperator(supabase, operatorId)
      await refresh()
    } catch (err) {
      console.error('[operators] delete failed', err)
      setError(safeDbError(err, 'Gagal menghapus operator.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Manajemen Operator</h1>
          <p className="text-xs text-[#444748]">Nama, Divisi, status (Aktif/Libur/Cuti/Nonaktif) dan soft delete</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/command-center')}
          className="text-xs uppercase tracking-widest text-[#755b00] hover:underline"
        >
          Kembali
        </button>
      </header>

      <main className="px-4 sm:px-8 lg:px-16 py-8 max-w-3xl mx-auto space-y-8">
        {error && (
          <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded text-sm text-[#ba1a1a]">
            {error}
          </div>
        )}

        <section className="bg-white border-[0.5px] border-[#c4c7c7] p-4 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#444748] font-bold">Tambah Operator</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newNama}
              onChange={e => setNewNama(e.target.value)}
              placeholder="Nama operator"
              className="flex-1 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
            />
            <select
              value={newDivisionId}
              onChange={e => setNewDivisionId(e.target.value)}
              className="sm:w-56 py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00] bg-white"
            >
              <option value="">Pilih divisi…</option>
              {divisions.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
            >
              {creating ? 'Menambah...' : 'Tambah'}
            </button>
          </div>
          <p className="text-[11px] text-[#444748]">
            Nama boleh sama untuk operator berbeda — identitas operator memakai ID unik, bukan nama.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-[#444748] font-bold">
            Daftar Operator {loading && '· Memuat...'}
          </h2>
          {operators.length === 0 && (
            <p className="text-sm text-[#444748]">Belum ada operator.</p>
          )}
          {operators.map(op => (
            <div key={op.id} className="bg-white border-[0.5px] border-[#c4c7c7] p-4">
              {editingId === op.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editNama}
                    onChange={e => setEditNama(e.target.value)}
                    className="w-full py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00]"
                  />
                  <select
                    value={editDivisionId}
                    onChange={e => setEditDivisionId(e.target.value)}
                    className="w-full py-2 px-3 border border-[#c4c7c7] text-sm outline-none focus:border-[#755b00] bg-white"
                  >
                    <option value="">Belum diatur</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-hanken text-sm font-semibold">{op.nama}</p>
                    <p className="text-xs text-[#444748]">{op.divisi || 'Divisi belum diatur'}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest ${STATUS_BADGE[op.status]}`}
                    >
                      {OPERATOR_STATUS_LABELS[op.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      value={op.status}
                      onChange={e => handleStatusChange(op.id, e.target.value as OperatorStatus)}
                      className="py-1.5 px-2 border border-[#c4c7c7] text-xs outline-none"
                    >
                      {OPERATOR_STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>
                          {OPERATOR_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => startEdit(op)}
                      className="text-xs text-[#755b00] hover:underline"
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(op.id)}
                      className="text-xs text-[#ba1a1a] hover:underline"
                    >
                      Hapus
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
