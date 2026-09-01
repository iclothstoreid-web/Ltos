import type { SupabaseClient } from '@supabase/supabase-js'
import type { OrderPayment } from './types'

export const PAYMENT_PROOF_BUCKET = 'payment-proofs'

// Uploads a Transfer/QRIS proof image or PDF into the private payment-proofs
// bucket and returns its storage PATH (never a URL — the bucket is private;
// viewing goes through /api/payment-proof/signed-url). Path is
// `<orderId>/<uuid>.<ext>` so proofs stay grouped per order.
export async function uploadPaymentProof(
  supabase: SupabaseClient,
  params: { orderId: string; file: File }
): Promise<string> {
  const ext = params.file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${params.orderId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .upload(path, params.file, { upsert: false, contentType: params.file.type || undefined })
  if (error) throw error

  return path
}

// Attaches an uploaded proof path to an already-recorded payment. Kept
// separate from record_order_payment so a proof failure never blocks the
// payment itself.
export async function attachPaymentProof(
  supabase: SupabaseClient,
  paymentId: string,
  proofPath: string
): Promise<OrderPayment> {
  const { data, error } = await supabase.rpc('attach_payment_proof', {
    p_payment_id: paymentId,
    p_proof_path: proofPath,
  })
  if (error) throw error
  return data as OrderPayment
}

// Mints a short-TTL signed URL for a stored proof (server route does the
// staff check + storage sign). Returns null on any failure so the caller
// can just hide the "Lihat Bukti" link.
export async function getPaymentProofSignedUrl(proofPath: string): Promise<string | null> {
  try {
    const res = await fetch('/api/payment-proof/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: proofPath }),
    })
    const data = await res.json()
    return res.ok && data.success ? (data.signedUrl as string) : null
  } catch {
    return null
  }
}
