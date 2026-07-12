'use client'

import { useRouter } from 'next/navigation'
import { PriorityTask } from '@/types'
import { ChevronRight } from 'lucide-react'

interface PriorityTaskRowProps {
  task: PriorityTask
  index: number
  waitingTime: string
}

export function PriorityTaskRow({ task, index, waitingTime }: PriorityTaskRowProps) {
  const router = useRouter()

  const urgencyConfig = {
    critical: { dot: 'bg-error animate-pulse-dot', number: 'text-error' },
    high: { dot: 'bg-warm-gold', number: 'text-warm-gold' },
    normal: { dot: 'bg-secondary', number: 'text-secondary' },
    ready: { dot: 'bg-primary', number: 'text-primary' },
  }

  const config = urgencyConfig[task.urgency]

  return (
    <li
      onClick={() => router.push(task.workspace_url)}
      className="task-row group"
    >
      {/* Index */}
      <span className={`text-label font-medium w-6 flex-shrink-0 mt-0.5 ${config.number}`}>
        {index < 10 ? `0${index}` : index}
      </span>

      {/* Status dot */}
      <span className={`status-dot ${task.urgency} mt-2`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-body font-medium text-on-surface">
              {task.customer_name}
            </p>
            <p className="text-body text-secondary mt-0.5">
              {task.task_label} · {task.order_number}
            </p>
            <p className="text-label text-secondary mt-1">
              {task.context}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-mono text-secondary">
              {waitingTime}
            </span>
            <ChevronRight
              size={16}
              className="text-secondary group-hover:text-on-surface group-hover:translate-x-0.5
                         transition-all duration-150"
            />
          </div>
        </div>
      </div>
    </li>
  )
}
