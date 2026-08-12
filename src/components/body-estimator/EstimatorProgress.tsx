interface EstimatorProgressProps {
  currentStep: number
  totalSteps: number
  label?: string
}

// Sprint W0.1 — "Step 1 of 3" indicator sitting above the form. Purely
// presentational for this sprint (form has only one real step so far);
// currentStep/totalSteps are props so a future sprint can wire real
// multi-step state without touching this component.
export function EstimatorProgress({ currentStep, totalSteps, label }: EstimatorProgressProps) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={label ?? `Step ${currentStep} of ${totalSteps}`}
        className="flex items-center gap-1.5"
      >
        {Array.from({ length: totalSteps }).map((_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`h-1 w-8 rounded-full transition-colors ${
              index < currentStep ? 'bg-luxury-gold' : 'bg-luxury-gold/15'
            }`}
          />
        ))}
      </div>
      <span aria-hidden="true" className="font-luxury-sans text-xs uppercase tracking-[0.14em] text-luxury-taupe">
        {label ?? `Step ${currentStep} of ${totalSteps}`}
      </span>
    </div>
  )
}
