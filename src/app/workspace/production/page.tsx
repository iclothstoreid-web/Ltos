import { redirect } from 'next/navigation'

// Back-compat only — Production moved to /production (src/app/production).
// Keeps any bookmarked or previously-shared /workspace/production link alive.
export default function LegacyProductionEntryRedirect() {
  redirect('/production')
}
