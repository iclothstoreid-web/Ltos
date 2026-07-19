'use client'

import { useEffect, useState } from 'react'

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function buildMonthGrid(date: Date): Array<number | null> {
  const year = date.getFullYear()
  const month = date.getMonth()
  const startOffset = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: Array<number | null> = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// Ticks client-side only (starts `now` as null and fills it in on mount) so
// the server-rendered markup never shows a timestamp that would mismatch
// the client's first render.
export function ClockCalendar() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeLabel = now
    ? now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--'
  const dateLabel = now
    ? now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const monthLabel = now
    ? now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    : ''
  const grid = now ? buildMonthGrid(now) : []
  const today = now?.getDate()

  return (
    <section className="rounded-xl border border-outline-variant bg-surface/40 p-5">
      <h2 className="text-label text-secondary uppercase tracking-widest">Jam &amp; Kalender</h2>

      <p className="font-serif text-on-surface text-[32px] mt-3 tracking-[-0.02em] tabular-nums">{timeLabel}</p>
      <p className="text-body text-secondary mt-1">{dateLabel}</p>

      <div className="mt-5 border-t border-outline-variant pt-4">
        <p className="text-label text-secondary uppercase tracking-widest mb-3">{monthLabel}</p>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {DAY_LABELS.map(d => (
            <span key={d} className="text-label text-secondary/80 uppercase">{d}</span>
          ))}
          {grid.map((day, idx) => (
            <span
              key={idx}
              className={`text-body py-1 rounded-full ${
                day === today ? 'bg-primary text-white font-medium' : 'text-on-surface'
              }`}
            >
              {day ?? ''}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
