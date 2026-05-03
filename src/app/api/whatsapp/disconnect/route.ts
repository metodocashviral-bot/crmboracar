import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { deleteInstance } from '@/lib/evolution/api'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY

  const { data: settings } = await supabaseAdmin
    .from('company_settings')
    .select('*')
    .limit(1)
    .single()

  if (evolutionUrl && evolutionKey && settings?.evolution_instance) {
    try {
      await deleteInstance({ url: evolutionUrl, apiKey: evolutionKey, instance: settings.evolution_instance })
    } catch {}
  }

  await supabaseAdmin
    .from('company_settings')
    .update({ whatsapp_connected: false, whatsapp_number: null, evolution_instance: null })
    .eq('id', settings!.id)

  return NextResponse.json({ success: true })
}
