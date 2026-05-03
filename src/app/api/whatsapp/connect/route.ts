import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createInstance } from '@/lib/evolution/api'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const evolutionUrl = process.env.EVOLUTION_API_URL
    const evolutionKey = process.env.EVOLUTION_API_KEY

    if (!evolutionUrl || !evolutionKey) {
      return NextResponse.json({ error: 'EVOLUTION_API_URL ou EVOLUTION_API_KEY não definidos no .env' }, { status: 500 })
    }

    // Buscar settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('id, evolution_instance')
      .limit(1)
      .single()

    if (settingsError || !settings) {
      console.error('[connect] settings error:', settingsError)
      return NextResponse.json({ error: `Erro ao buscar configurações: ${settingsError?.message}` }, { status: 500 })
    }

    const instanceName = settings.evolution_instance || `crmboracar-${Date.now()}`

    // Criar instância na Evolution API
    try {
      await createInstance(instanceName, { url: evolutionUrl, apiKey: evolutionKey })
    } catch (err: any) {
      console.error('[connect] createInstance error:', err.message)
      if (!err.message?.includes('already')) {
        return NextResponse.json({ error: `Evolution API: ${err.message}` }, { status: 500 })
      }
    }

    // Salvar nome da instância
    const { error: updateError } = await supabaseAdmin
      .from('company_settings')
      .update({ evolution_instance: instanceName, whatsapp_connected: false })
      .eq('id', settings.id)

    if (updateError) {
      console.error('[connect] update error:', updateError)
      return NextResponse.json({ error: `Erro ao salvar instância: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, instance: instanceName })
  } catch (err: any) {
    console.error('[connect] unexpected error:', err)
    return NextResponse.json({ error: err.message || 'Erro inesperado' }, { status: 500 })
  }
}
