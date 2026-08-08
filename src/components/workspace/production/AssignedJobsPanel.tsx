'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { listPendingAssignments, markNotificationRead } from '@/lib/production/client'
import type { PendingAssignment } from '@/lib/production/types'
import { STAGE_LABELS } from '@/lib/production/stageConfig'
import { scanTokenKey } from '@/lib/production/accessToken'

// Kiosk-wide "Pekerjaan Baru Ditugaskan" list — operators have no login, so
// this can't be a personal push notification. Any operator at this shared
// device sees every unread assignment; tapping "Buka Pekerjaan" grants entry
// the same way a QR scan does (see ProductionAccessGate) and marks it read.
export function AssignedJobsPanel() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [jobs, setJobs] = useState<PendingAssignment[]>([])
  const [open, setOpen] = useState(false)

  async function refresh() {
    try {
      setJobs(await listPendingAssignments(supabase))
    } catch (err) {
      console.error('[production] list pending assignments failed', err)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleOpenJob(job: PendingAssignment) {
    // Fire-and-forget — mark-as-read is a bookkeeping side effect, not a
    // gate for entry (ProductionAccessGate grants access via the
    // sessionStorage token below, not via notification read state), so it
    // must never delay or block the navigation it's attached to.
    markNotificationRead(supabase, job.notification_id).catch(err => {
      console.error('[production] mark notification read failed', err)
    })
    sessionStorage.setItem(scanTokenKey(job.order_id), '1')
    router.push(`/production/${job.order_id}`)
  }

  return (
    <div className="fixed top-6 right-6 z-[65]">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative w-11 h-11 rounded-full bg-white/10 border border-white/30 flex items-center
                   justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Pekerjaan Baru Ditugaskan"
      >
        <Bell size={18} />
        {jobs.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-error
                            text-white text-[10px] font-hanken font-semibold flex items-center justify-center">
            {jobs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-h-[70vh] overflow-y-auto bg-white rounded-sm shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
            <p className="font-hanken text-xs uppercase tracking-widest text-secondary">
              Pekerjaan Baru Ditugaskan
            </p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">
              <X size={16} className="text-secondary" />
            </button>
          </div>

          {jobs.length === 0 ? (
            <p className="px-4 py-6 font-hanken text-sm text-secondary text-center">
              Tidak ada pekerjaan baru.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {jobs.map(job => (
                <li key={job.notification_id} className="px-4 py-4">
                  <p className="font-hanken text-sm font-semibold text-on-surface">{job.order_number}</p>
                  <p className="font-hanken text-xs text-secondary mt-0.5">
                    Customer: {job.customer_name || '—'}
                  </p>
                  <p className="font-hanken text-xs text-secondary">
                    Tahap: {STAGE_LABELS[job.stage]}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenJob(job)}
                    className="mt-3 w-full py-2 bg-on-surface text-white font-hanken text-xs font-semibold
                               uppercase tracking-widest hover:bg-amber-mid transition-colors"
                  >
                    Buka Pekerjaan
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
