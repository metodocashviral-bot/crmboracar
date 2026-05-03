import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { setWebhook } from '@/lib/evolution/api'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL não definida' }, { status: 500 })

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  if (!evolutionUrl || !evolutionKey) return NextResponse.json({ error: 'Evolution API não configurada' }, { status: 500 })

  const { data: settings } = await getSupabaseAdmin()
    .from('company_settings')
    .select('evolution_instance')
    .limit(1)
    .single()

  if (!settings?.evolution_instance) return NextResponse.json({ error: 'WhatsApp não conectado' }, { status: 400 })

  const cfg = { url: evolutionUrl, apiKey: evolutionKey, instance: settings.evolution_instance }
  const webhookUrl = `${appUrl}/api/webhook/evolution`

  try {
    await setWebhook(cfg, webhookUrl)
    return NextResponse.json({ success: true, webhookUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
