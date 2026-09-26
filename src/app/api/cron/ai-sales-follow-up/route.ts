import { runDueFollowUps } from '@/lib/ai-sales/follow-up'

export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  try {
    return Response.json(await runDueFollowUps())
  } catch (error) {
    console.error('AI Sales follow-up cron failed', error)
    return Response.json({ error: 'follow_up_failed' }, { status: 500 })
  }
}
