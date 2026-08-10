import { BASIC_BODY_DATA_KEYS, BASIC_BODY_DATA_LABELS, BASIC_BODY_DATA_UNITS } from './types'
import type { BasicBodyDataKey, MeasurementFields } from './types'

interface BasicBodyDataSummaryProps {
  fields: Pick<MeasurementFields, BasicBodyDataKey> | null | undefined
  wrapperClassName?: string
  itemClassName?: string
}

// Read-only reference line shared by every downstream surface Basic Body
// Data flows to (Pattern Formulation panel, QC/Cutting/Sewing's read-only
// Data Acuan card, the printed Production Specification Sheet, Order
// Summary) — one place for the label/unit formatting and the
// none-captured-yet guard, instead of 4 copies. Renders nothing (not even
// its wrapper) if none of the 3 fields were ever captured, e.g. orders
// created before this sprint.
export function BasicBodyDataSummary({ fields, wrapperClassName, itemClassName }: BasicBodyDataSummaryProps) {
  if (!fields) return null
  const present = BASIC_BODY_DATA_KEYS.filter(key => fields[key])
  if (present.length === 0) return null

  return (
    <div className={wrapperClassName}>
      {present.map(key => (
        <span key={key} className={itemClassName}>
          {BASIC_BODY_DATA_LABELS[key]}: {fields[key]} {BASIC_BODY_DATA_UNITS[key]}
        </span>
      ))}
    </div>
  )
}
