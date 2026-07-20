import type { SupabaseClient } from '@supabase/supabase-js'

// Packing Video is a column on production_stage_records (video_url), not a
// separate table -- see 20260723000000_add_packing_video.sql. Reads happen
// via get_production_packet's existing stage_records payload; this module
// only handles the write path: upload the file, then persist the URL
// through the set_packing_video RPC (SECURITY DEFINER, validates the target
// record is a 'packing' stage record).
export const PACKING_VIDEO_MAX_BYTES = 50 * 1024 * 1024
export const PACKING_VIDEO_ACCEPTED_TYPES = ['video/mp4', 'video/quicktime']

export async function uploadPackingVideo(
  supabase: SupabaseClient,
  params: { orderId: string; stageRecordId: string; file: File }
): Promise<string> {
  const { orderId, stageRecordId, file } = params

  if (!PACKING_VIDEO_ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Format video harus mp4 atau mov.')
  }
  if (file.size > PACKING_VIDEO_MAX_BYTES) {
    throw new Error('Ukuran video maksimal 50 MB.')
  }

  const ext = file.name.split('.').pop() || 'mp4'
  const path = `${orderId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('production-packing-video')
    .upload(path, file, { upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('production-packing-video').getPublicUrl(path)

  const { error: rpcError } = await supabase.rpc('set_packing_video', {
    p_order_id: orderId,
    p_stage_record_id: stageRecordId,
    p_video_url: data.publicUrl,
  })
  if (rpcError) throw rpcError

  return data.publicUrl
}
