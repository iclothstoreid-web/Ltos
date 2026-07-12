import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatWaitingTime } from '@/lib/ltos'
import { PriorityTaskRow } from '@/components/command-center/PriorityTaskRow'
import { StatusStrip } from '@/components/command-center/StatusStrip'
import { TopBar } from '@/components/command-center/TopBar'
import { PriorityTask } from '@/types'

export default async function CommandCenterPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: queueData } = await supabase
    .from('queue_assignments')
    .select('id, order_id, queue_type, status, assigned_to, created_at, completed_at')
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: true })

  const tasks: PriorityTask[] = []

  if (queueData && queueData.length > 0) {
    for (const q of queueData) {
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, current_state')
        .eq('id', q.order_id)
        .single()

      if (!order) continue

      const { data: customer } = await supabase
        .from('customers')
        .select('name')
        .eq('id', q.order_id)
        .single()

      const customerName = customer?.name || 'Unknown'

      const hoursWaiting = (Date.now() - new Date(q.created_at).getTime()) / (1000 * 60 * 60)
      const urgency = hoursWaiting > 48 ? 'critical' : hoursWaiting > 24 ? 'high' : 'normal'

      tasks.push({
        id: q.id,
        order_id: q.order_id,
        order_number: order.order_number,
        customer_name: customerName,
        task_type: q.queue_type,
        task_label: q.queue_type,
        context: 'Task',
        waiting_since: q.created_at,
        urgency: urgency as 'critical' | 'high' | 'normal' | 'ready',
        workspace_url: `/workspace/${q.queue_type}/${q.order_id}`,
      })
    }
  }

  const sorted = tasks.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, normal: 2, ready: 3 }
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
  })

  const critical = sorted.filter(t => t.urgency === 'critical').length
  const high = sorted.filter(t => t.urgency === 'high').length
  const normal = sorted.filter(t => t.urgency === 'normal').length

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
        <p className="text-label text-secondary uppercase tracking-widest mb-1">
          {today}
        </p>

        <StatusStrip critical={critical} high={high} normal={normal} />

        <div className="border-t border-outline-variant my-8" />

        <h2 className="text-label text-secondary uppercase tracking-widest mb-6">
          Yang harus dikerjakan sekarang
        </h2>

        {sorted.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-title text-on-surface mb-2">Semua selesai.</p>
            <p className="text-body text-secondary">
              Tidak ada task yang perlu dikerjakan saat ini.
            </p>
          </div>
        ) : (
          <ol className="border-t border-outline-variant">
            {sorted.map((task, index) => (
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
