'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Operator, OperatorStatus } from '@/lib/production/types'
import { OPERATOR_STATUS_LABELS, OPERATOR_STATUS_OPTIONS } from '@/lib/operators/types'
import { createOperator, listAllOperators, setOperatorStatus, softDeleteOperator, updateOperator } from '@/lib/operators/client'

interface OperatorManagerProps {
  initialOperators: Operator[]
}

const STATUS_BADGE: Record<OperatorStatus, string> = {
  aktif: 'bg-[#dff2df] text-[#1f6b2c]',
  libur: 'bg-[#f3ecd8] text-[#755b00]',
  cuti: 'bg-[#f3ecd8] text-[#755b00]',
  nonaktif: 'bg-[#f3d8d8] text-[#a33]',
}

// Sprint K Operator Management — CRUD + status (Aktif/Libur/Cuti/Nonaktif) +
// soft delete. Every write here goes through the RPC surface in
// supabase/migrations/20260804000000_add_operator_management.sql, which
// keeps production_operators.is_active in sync via trigger — so marking
// someone Libur/Cuti/Nonaktif here automatically removes them from every
// existing capacity/KPI/picker query without touching that code (Capacity
// Integration requirement). Divisi assignment stays read-only here (UX
// Cleanup sprint) — an operator's division_id, once set, carries through
// edits unchanged; it's just no longer choosable from this form.
export function OperatorManager({ initialOperators }: OperatorManagerProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [operators, setOperators] = useState(initialOperators)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newNama, setNewNama] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNama, setEditNama] = useState('')
  const [editDivisionId, setEditDivisionId] = useState<string | null>(null)

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
    if (!newNama.trim()) return
    setCreating(true)
    setError(null)
    try {
      await createOperator(supabase, newNama, null)
      setNewNama('')
      await refresh()
    } catch (err) {
      console.error('[operators] create failed', err)
      setError('Gagal menambah operator.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(op: Operator) {
    setEditingId(op.id)
    setEditNama(op.nama)
    setEditDivisionId(op.division_id ?? null)
  }

  async function handleSaveEdit() {
    if (!editingId) return
    setLoading(true)
    setError(null)
    try {
      await updateOperator(supabase, editingId, editNama, editDivisionId)
      setEditingId(null)
      await refresh()
    } catch (err) {
      console.error('[operators] update failed', err)
      setError('Gagal mengubah operator.')
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
      setError('Gagal mengubah status operator.')
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
      setError('Gagal menghapus operator.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <header className="h-20 border-b-[0.5px] border-[#c4c7c7] flex items-center px-4 sm:px-8 lg:px-16 justify-between">
        <div>
          <h1 className="font-fraunces text-xl">Manajemen Operator</h1>
          <p className="text-xs text-[#444748]">Status (Aktif/Libur/Cuti/Nonaktif) dan soft delete</p>
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
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !newNama.trim()}
              className="py-2 px-4 bg-[#161b29] text-white text-xs uppercase tracking-widest hover:bg-[#755b00] transition-colors disabled:opacity-40"
            >
              {creating ? 'Menambah...' : 'Tambah'}
            </button>
          </div>
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
