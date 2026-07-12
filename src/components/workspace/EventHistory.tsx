import { BusinessEvent } from '@/types'

interface EventHistoryProps {
  events: (BusinessEvent & { profiles?: { name: string } | null })[]
}

export function EventHistory({ events }: EventHistoryProps) {
  if (events.length === 0) {
    return (
      <p className="text-body text-secondary mt-4">
        Belum ada event untuk order ini.
      </p>
    )
  }

  return (
    <div className="mt-4 space-y-0 border-t border-outline-variant">
      {events.map(event => (
        <div
          key={event.id}
          className="py-4 border-b border-outline-variant flex items-start gap-4"
        >
          {/* Dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant flex-shrink-0 mt-2" />

          {/* Content */}
          <div className="flex-1">
            <p className="text-mono text-on-surface">{event.event_type}</p>
            {event.profiles?.name && (
              <p className="text-label text-secondary mt-0.5">
                {event.profiles.name}
              </p>
            )}
          </div>

          {/* Time */}
          <span className="text-label text-secondary flex-shrink-0">
            {new Date(event.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ))}
    </div>
  )
}
