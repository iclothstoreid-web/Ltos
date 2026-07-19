import { SectionShell } from './SectionShell'

interface GreetingSectionProps {
  customerName: string
}

export function GreetingSection({ customerName }: GreetingSectionProps) {
  return (
    <SectionShell centered divider={false}>
      <h1 className="font-fraunces text-3xl text-on-surface mb-2">Halo, {customerName}.</h1>
      <p className="font-sans text-body text-secondary">
        Selamat datang di perjalanan pembuatan pakaian Anda.
      </p>
    </SectionShell>
  )
}
