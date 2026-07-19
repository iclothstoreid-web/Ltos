import { redirect } from 'next/navigation'

interface Props {
  params: { orderId: string }
}

// Back-compat only — Production moved to /production/[orderId]
// (src/app/production/[orderId]). Keeps any bookmarked or previously-shared
// /workspace/production/[orderId] link alive.
export default function LegacyProductionPacketRedirect({ params }: Props) {
  redirect(`/production/${params.orderId}`)
}
