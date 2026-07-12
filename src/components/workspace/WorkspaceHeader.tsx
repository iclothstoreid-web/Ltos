import { WorkflowState } from '@/types'
import { STATE_LABELS } from '@/lib/ltos'

interface WorkspaceHeaderProps {
  customerName: string
  orderNumber: string
  currentState: WorkflowState
  stateLabel?: string
}

const WORKFLOW_STATES: WorkflowState[] = [
  'lead', 'consultation', 'appointment', 'measurement',
  'quotation', 'order', 'assign', 'production', 'qc', 'delivery', 'follow_up'
]

export function WorkspaceHeader({
  customerName,
  orderNumber,
  currentState,
  stateLabel,
}: WorkspaceHeaderProps) {
  const currentIndex = WORKFLOW_STATES.indexOf(currentState)

  return (
    <div>
      {/* Customer name — large, serif, calm */}
      <h1 className="font-serif text-display text-on-surface leading-none">
        {customerName}
      </h1>

      {/* Order metadata */}
      <div className="flex items-center gap-3 mt-3">
        <span className="text-mono text-secondary">{orderNumber}</span>
        <span className="text-secondary">·</span>
        <span className="text-body text-secondary">
          {STATE_LABELS[currentState]}
        </span>
        {stateLabel && (
          <>
            <span className="text-secondary">·</span>
            <span className="text-label text-secondary">{stateLabel}</span>
          </>
        )}
      </div>

      {/* Minimal workflow position — text only, not progress bar */}
      <div className="flex items-center gap-1 mt-4 flex-wrap">
        {WORKFLOW_STATES.map((state, index) => (
          <span key={state} className="flex items-center gap-1">
            <span
              className={`text-label ${
                index < currentIndex
                  ? 'text-primary'
                  : index === currentIndex
                  ? 'text-on-surface font-medium'
                  : 'text-secondary/40'
              }`}
            >
              {STATE_LABELS[state]}
            </span>
            {index < WORKFLOW_STATES.length - 1 && (
              <span className="text-secondary/30 text-label">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
