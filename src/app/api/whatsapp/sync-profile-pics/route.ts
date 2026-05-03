import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { fetchProfilePicture } from '@/lib/evolution/api'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  if (!evolutionUrl || !evolutionKey) return NextResponse.json({ error: 'Evolution API não configurada' }, { status: 500 })

  const admin = getSupabaseAdmin()
  const { data: settings } = await admin.from('company_settings').select('evolution_instance').limit(1).single()
  if (!settings?.evolution_instance) return NextResponse.json({ error: 'WhatsApp não conectado' }, { status: 400 })

  const cfg = { url: evolutionUrl, apiKey: evolutionKey, instance: settings.evolution_instance }

  // Fetch all contacts
  const { data: contacts } = await admin.from('contacts').select('id, phone').order('created_at', { ascending: false }).limit(100)
  if (!contacts?.length) return NextResponse.json({ updated: 0 })

  let updated = 0
  for (const contact of contacts) {
    const picUrl = await fetchProfilePicture(contact.phone, cfg)
    if (picUrl) {
      await admin.from('contacts').update({ profile_pic_url: picUrl }).eq('id', contact.id)
      updated++
    }
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200))
  }

  return NextResponse.json({ updated, total: contacts.length })
}
