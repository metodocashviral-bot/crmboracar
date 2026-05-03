import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendTextMessage } from '@/lib/evolution/api'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ticketId, content, agentId } = await req.json()
  if (!ticketId || !content) {
    return NextResponse.json({ error: 'ticketId and content required' }, { status: 400 })
  }

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  if (!evolutionUrl || !evolutionKey) {
    return NextResponse.json({ error: 'Evolution API não configurada no servidor' }, { status: 500 })
  }

  const { data: ticket } = await supabaseAdmin
    .from('tickets')
    .select('*, contact:contacts(*)')
    .eq('id', ticketId)
    .single()

  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

  const { data: settings } = await supabaseAdmin
    .from('company_settings')
    .select('evolution_instance')
    .limit(1)
    .single()

  if (!settings?.evolution_instance) {
    return NextResponse.json({ error: 'WhatsApp não conectado' }, { status: 400 })
  }

  const cfg = { url: evolutionUrl, apiKey: evolutionKey, instance: settings.evolution_instance }

  try {
    await sendTextMessage(ticket.contact.phone, content, cfg)
  } catch (err: any) {
    return NextResponse.json({ error: `Evolution API: ${err.message}` }, { status: 500 })
  }

  const { data: message } = await supabaseAdmin
    .from('messages')
    .insert({
      ticket_id: ticketId,
      contact_id: ticket.contact_id,
      sender_type: 'agent',
      agent_id: agentId || user.id,
      content,
    })
    .select('*, agent:profiles(*)')
    .single()

  await supabaseAdmin
    .from('tickets')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', ticketId)

  return NextResponse.json({ message })
}
