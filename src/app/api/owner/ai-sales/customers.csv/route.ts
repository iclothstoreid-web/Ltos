import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'owner'].includes(profile.role)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { data, error } = await supabase
    .from('ai_sales_customer_contacts')
    .select('display_name, phone_e164, whatsapp_profile_name, is_existing_customer, order_count, first_seen_at, last_seen_at')
    .order('last_seen_at', { ascending: false })

  if (error) {
    return new NextResponse('Failed to export customer database', { status: 500 })
  }

  const rows = [
    ['Nama', 'No HP', 'Nama WhatsApp', 'Customer Lama', 'Jumlah Order', 'Pertama Terlihat', 'Terakhir Terlihat'],
    ...(data ?? []).map(row => [
      row.display_name ?? '',
      row.phone_e164 ? `+${row.phone_e164}` : '',
      row.whatsapp_profile_name ?? '',
      row.is_existing_customer ? 'Ya' : 'Belum',
      row.order_count ?? 0,
      row.first_seen_at ?? '',
      row.last_seen_at ?? '',
    ]),
  ]

  const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="local-tailor-customer-database.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
