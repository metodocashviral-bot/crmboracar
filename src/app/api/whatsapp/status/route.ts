import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getConnectionState, fetchInstance, setWebhook } from '@/lib/evolution/api'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  if (!evolutionUrl || !evolutionKey) return NextResponse.json({ state: 'close' })

  const { data: settings } = await getSupabaseAdmin()
    .from('company_settings')
    .select('*')
    .limit(1)
    .single()

  if (!settings?.evolution_instance) return NextResponse.json({ state: 'close' })

  const cfg = { url: evolutionUrl, apiKey: evolutionKey, instance: settings.evolution_instance }

  try {
    const stateData = await getConnectionState(cfg)
    const state = stateData?.instance?.state || stateData?.state || 'close'

    if (state === 'open') {
      let number = settings.whatsapp_number
      if (!number) {
        try {
          const instanceData = await fetchInstance(cfg)
          const inst = Array.isArray(instanceData) ? instanceData[0] : instanceData
          number = inst?.instance?.profileName || inst?.instance?.wuid?.replace('@s.whatsapp.net', '') || ''
        } catch {}
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
      if (appUrl) {
        try { await setWebhook(cfg, `${appUrl}/api/webhook/evolution`) } catch {}
      }

      await getSupabaseAdmin()
        .from('company_settings')
        .update({ whatsapp_connected: true, whatsapp_number: number || null })
        .eq('id', settings.id)

      return NextResponse.json({ state: 'open', number })
    }

    return NextResponse.json({ state })
  } catch (err: any) {
    return NextResponse.json({ state: 'close', error: err.message })
  }
}
