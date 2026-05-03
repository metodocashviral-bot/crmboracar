import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getQRCode } from '@/lib/evolution/api'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  if (!evolutionUrl || !evolutionKey) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const { data: settings } = await getSupabaseAdmin()
    .from('company_settings')
    .select('evolution_instance')
    .limit(1)
    .single()

  if (!settings?.evolution_instance) return NextResponse.json({ error: 'No instance' }, { status: 400 })

  try {
    const data = await getQRCode({ url: evolutionUrl, apiKey: evolutionKey, instance: settings.evolution_instance })
    console.log('[qrcode] Evolution API response:', JSON.stringify(data).slice(0, 200))
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[qrcode] error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
