'use client'

import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Operator } from '@/lib/production/types'
import { searchOperators, upsertOperator } from '@/lib/production/client'
import { OPERATOR_DIVISI_OPTIONS } from '@/lib/production/stageConfig'

interface OperatorAutocompleteProps {
  supabase: SupabaseClient
  value: Operator | null
  onChange: (operator: Operator) => void
  onReset: () => void
  // Sprint K "Tambahkan pilihan Divisi saat memilih operator": when set
  // (e.g. the current production stage's label, or 'Fitting' for the
  // check-in Fitter picker), search results are filtered to operators in
  // that divisi and a new inline operator defaults into it — never a hard
  // block, since legacy operators may still have divisi = null.
  divisiHint?: string | null
}

// Mirrors check-in's CustomerSearch: search-as-you-type, and if nothing
// matches, an explicit "+ Tambah operator baru" action — never a silent
// auto-insert on every scan.
export function OperatorAutocomplete({ supabase, value, onChange, onReset, divisiHint }: OperatorAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Operator[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newDivisi, setNewDivisi] = useState(divisiHint || '')

  async function handleSearch(q: string) {
    setQuery(q)
    if (q.length < 1) {
      setResults([])
      setShowResults(false)
      return
    }
    setLoading(true)
    try {
      const operators = await searchOperators(supabase, q, divisiHint ?? null)
      setResults(operators)
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateNew() {
    setLoading(true)
    try {
      const id = await upsertOperator(supabase, query, newDivisi || divisiHint || null)
      onChange({
        id,
        nama: query.trim(),
        is_active: true,
        divisi: newDivisi || divisiHint || null,
        status: 'aktif',
        deleted_at: null,
        max_concurrent_capacity: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setQuery('')
      setResults([])
      setShowResults(false)
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(operator: Operator) {
    onChange(operator)
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  if (value) {
    return (
      <div className="flex items-center justify-between border-b border-[#c6c6cc] py-3">
        <div>
          <p className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c]">
            Nama Operator
          </p>
          <p className="font-hanken text-sm text-[#161b29]">{value.nama}</p>
          {value.divisi && (
            <p className="font-hanken text-xs text-[#46464c]">Divisi: {value.divisi}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="font-hanken text-xs text-[#755b00] hover:underline"
        >
          Ganti
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-1">
        Nama Operator
      </label>
      <input
        type="text"
        value={query}
        onChange={e => handleSearch(e.target.value)}
        onFocus={() => query.length >= 1 && setShowResults(true)}
        placeholder="Ketik nama operator..."
        className="w-full py-2 bg-transparent border-b border-[#c6c6cc] focus:border-[#755b00]
                   outline-none font-hanken text-sm text-[#161b29] placeholder:text-[#46464c]/40
                   transition-colors"
      />

      {showResults && (
        <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#c6c6cc]/60 shadow-md max-h-64 overflow-y-auto">
          {results.map(op => (
            <button
              key={op.id}
              type="button"
              onClick={() => handleSelect(op)}
              className="w-full text-left px-4 py-2 font-hanken text-sm text-[#161b29] hover:bg-[#efedf0] transition-colors"
            >
              {op.nama}
              {op.divisi && (
                <span className="block font-hanken text-[10px] text-[#46464c]">{op.divisi}</span>
              )}
            </button>
          ))}

          {!loading && query.trim().length > 0 && (
            <div className="px-4 py-2 border-t border-[#c6c6cc]/40">
              <label className="font-hanken text-[10px] uppercase tracking-widest text-[#46464c] block mb-1">
                Divisi Operator Baru
              </label>
              <select
                value={newDivisi}
                onChange={e => setNewDivisi(e.target.value)}
                className="w-full py-1 mb-2 bg-transparent border-b border-[#c6c6cc] outline-none font-hanken text-sm text-[#161b29]"
              >
                <option value="">Tidak ditentukan</option>
                {OPERATOR_DIVISI_OPTIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full text-left font-hanken text-xs font-semibold text-[#755b00] hover:underline transition-colors uppercase tracking-widest"
              >
                + Tambah operator baru &quot;{query.trim()}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
