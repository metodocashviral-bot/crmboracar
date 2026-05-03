import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { fetchChats, fetchChatMessages } from '@/lib/evolution/api'
import { phoneFromJid } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  if (!evolutionUrl || !evolutionKey) {
    return NextResponse.json({ error: 'Evolution API não configurada' }, { status: 500 })
  }

  const admin = getSupabaseAdmin()

  const { data: settings } = await admin
    .from('company_settings')
    .select('evolution_instance')
    .limit(1)
    .single()

  if (!settings?.evolution_instance) {
    return NextResponse.json({ error: 'WhatsApp não conectado' }, { status: 400 })
  }

  const cfg = { url: evolutionUrl, apiKey: evolutionKey, instance: settings.evolution_instance }

  // Fetch last 20 individual chats (no groups)
  let chats: any[] = []
  try {
    const raw = await fetchChats(cfg)
    const list = Array.isArray(raw) ? raw : (raw?.chats || raw?.data || [])
    chats = list
      .filter((c: any) => {
        const jid: string = c.id || c.remoteJid || ''
        return jid.includes('@s.whatsapp.net')
      })
      .slice(0, 20)
  } catch (err: any) {
    return NextResponse.json({ error: `Erro ao buscar conversas: ${err.message}` }, { status: 500 })
  }

  let imported = 0
  let errors = 0

  for (const chat of chats) {
    try {
      const jid: string = chat.id || chat.remoteJid || ''
      const phone = phoneFromJid(jid)
      const contactName: string = chat.name || chat.pushName || ''

      // Upsert contact
      let contactId: string | null = null
      const { data: existing } = await admin.from('contacts').select('id').eq('phone', phone).maybeSingle()
      if (existing) {
        contactId = existing.id
        if (contactName && !existing) {
          await admin.from('contacts').update({ name: contactName }).eq('id', contactId)
        }
      } else {
        const { data: newContact } = await admin
          .from('contacts')
          .insert({ phone, name: contactName || null })
          .select('id')
          .single()
        contactId = newContact?.id || null
      }
      if (!contactId) continue

      // Find or create ticket
      let ticketId: string | null = null
      const { data: openTicket } = await admin
        .from('tickets')
        .select('id')
        .eq('contact_id', contactId)
        .neq('status', 'finished')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (openTicket) {
        ticketId = openTicket.id
      } else {
        const lastMessageAt = chat.lastMessage?.messageTimestamp
          ? new Date(Number(chat.lastMessage.messageTimestamp) * 1000).toISOString()
          : new Date().toISOString()

        const { data: newTicket } = await admin
          .from('tickets')
          .insert({ contact_id: contactId, status: 'in_progress', last_message_at: lastMessageAt })
          .select('id')
          .single()
        ticketId = newTicket?.id || null
      }
      if (!ticketId) continue

      // Fetch and import messages
      try {
        const msgRaw = await fetchChatMessages(cfg, jid, 30)
        const messages: any[] = Array.isArray(msgRaw) ? msgRaw : (msgRaw?.messages || msgRaw?.data || [])

        for (const msg of messages) {
          const waId: string = msg.key?.id || ''
          const fromMe: boolean = msg.key?.fromMe || false
          const content: string =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            '[Mídia]'
          const ts = msg.messageTimestamp
            ? new Date(Number(msg.messageTimestamp) * 1000).toISOString()
            : new Date().toISOString()

          if (!content || content === '[Mídia]') continue

          // Skip duplicates
          if (waId) {
            const { count } = await admin
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('whatsapp_message_id', waId)
            if ((count ?? 0) > 0) continue
          }

          await admin.from('messages').insert({
            ticket_id: ticketId,
            contact_id: contactId,
            sender_type: fromMe ? 'agent' : 'contact',
            content,
            whatsapp_message_id: waId || null,
            created_at: ts,
          })
        }
      } catch {}

      imported++
    } catch {
      errors++
    }
  }

  return NextResponse.json({ imported, errors, total: chats.length })
}
