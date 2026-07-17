'use client'

import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Operator } from '@/lib/production/types'
import { searchOperators, upsertOperator } from '@/lib/production/client'

interface OperatorAutocompleteProps {
  supabase: SupabaseClient
  value: Operator | null
  onChange: (operator: Operator) => void
  onReset: () => void
}

// Mirrors check-in's CustomerSearch: search-as-you-type, and if nothing
// matches, an explicit "+ Tambah operator baru" action — never a silent
// auto-insert on every scan.
export function OperatorAutocomplete({ supabase, value, onChange, onReset }: OperatorAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Operator[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSearch(q: string) {
    setQuery(q)
    if (q.length < 1) {
      setResults([])
      setShowResults(false)
      return
    }
    setLoading(true)
    try {
      const operators = await searchOperators(supabase, q)
      setResults(operators)
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateNew() {
    setLoading(true)
    try {
      const id = await upsertOperator(supabase, query)
      onChange({
        id,
        nama: query.trim(),
        is_active: true,
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
        <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#c6c6cc]/60 shadow-md max-h-48 overflow-y-auto">
          {results.map(op => (
            <button
              key={op.id}
              type="button"
              onClick={() => handleSelect(op)}
              className="w-full text-left px-4 py-2 font-hanken text-sm text-[#161b29] hover:bg-[#efedf0] transition-colors"
            >
              {op.nama}
            </button>
          ))}

          {!loading && query.trim().length > 0 && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full text-left px-4 py-2 font-hanken text-xs font-semibold text-[#755b00] hover:bg-[#efedf0] transition-colors uppercase tracking-widest"
            >
              + Tambah operator baru &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
