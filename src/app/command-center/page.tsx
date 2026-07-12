import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { mapQueueToPriorityTask, formatWaitingTime } from '@/lib/ltos'
import { PriorityTaskRow } from '@/components/command-center/PriorityTaskRow'
import { StatusStrip } from '@/components/command-center/StatusStrip'
import { TopBar } from '@/components/command-center/TopBar'
import { PriorityTask } from '@/types'

export default async function CommandCenterPage() {
  const supabase = createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get all pending queue tasks with order + customer data
  const { data: queueData } = await supabase
    .from('queue_assignments')
    .select(`
      id,
      order_id,
      queue_type,
      status,
      assigned_to,
      created_at,
      orders (
        order_number,
        current_state,
        customers (
          name,
          phone
        )
      )
    `)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: true })

  // Map to priority tasks
  const tasks: PriorityTask[] = (queueData || [])
    .filter(q => q.orders)
    .map(q => mapQueueToPriorityTask(q as Parameters<typeof mapQueueToPriorityTask>[0]))
    .sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, normal: 2, ready: 3 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })

  // Status counts for strip
  const critical = tasks.filter(t => t.urgency === 'critical').length
  const high = tasks.filter(t => t.urgency === 'high').length
  const normal = tasks.filter(t => t.urgency === 'normal').length

  // Get today's date
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar profile={profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 animate-fade-in">

        {/* Date */}
        <p className="text-label text-secondary uppercase tracking-widest mb-1">
          {today}
        </p>

        {/* Status Strip */}
        <StatusStrip critical={critical} high={high} normal={normal} />

        {/* Divider */}
        <div className="border-t border-outline-variant my-8" />

        {/* Priority List Header */}
        <h2 className="text-label text-secondary uppercase tracking-widest mb-6">
          Yang harus dikerjakan sekarang
        </h2>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-title text-on-surface mb-2">Semua selesai.</p>
            <p className="text-body text-secondary">
              Tidak ada task yang perlu dikerjakan saat ini.
            </p>
          </div>
        ) : (
          <ol className="border-t border-outline-variant">
            {tasks.map((task, index) => (
              <PriorityTaskRow
                key={task.id}
                task={task}
                index={index + 1}
                waitingTime={formatWaitingTime(task.waiting_since)}
              />
            ))}
          </ol>
        )}
      </main>
    </div>
  )
}
