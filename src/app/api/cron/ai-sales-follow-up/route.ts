import { createAdminClient } from '@/lib/supabase/admin'
import { runDueFollowUps } from '@/lib/ai-sales/follow-up'

export const dynamic = 'force-dynamic'

async function isAuthorized(request: Request): Promise<boolean> {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return false

  const supplied = authorization.slice('Bearer '.length)
  const envSecret = process.env.CRON_SECRET
  if (envSecret && supplied === envSecret) return true

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('ai_sales_verify_followup_cron_secret', {
    p_secret: supplied,
  })
  if (error) {
    console.error('AI Sales follow-up cron auth failed', error)
    return false
  }
  return data === true
}

export async function GET(request: Request): Promise<Response> {
  if (!(await isAuthorized(request))) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    return Response.json(await runDueFollowUps())
  } catch (error) {
    console.error('AI Sales follow-up cron failed', error)
    return Response.json({ error: 'follow_up_failed' }, { status: 500 })
  }
}
