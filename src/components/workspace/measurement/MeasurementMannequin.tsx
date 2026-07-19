'use client'

interface MeasurementMannequinProps {
  className?: string
}

// Premium PNG mannequin, purely visual — no overlay/highlight/hotspot logic
// yet (that lands in a later sprint on top of this foundation).
export function MeasurementMannequin({ className = '' }: MeasurementMannequinProps) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <img
        src="/mannequin/mannequin.png"
        alt="Manekin pengukuran"
        className="max-w-full max-h-full w-auto h-auto object-contain"
        draggable={false}
      />
    </div>
  )
}
