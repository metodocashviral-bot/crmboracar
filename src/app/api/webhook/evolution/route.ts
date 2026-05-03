import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { phoneFromJid } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Evolution API sends different event names across versions
    const event: string = (body.event || body.type || '').toUpperCase()
    const isMessageEvent =
      event.includes('MESSAGE') ||
      event === 'MESSAGES_UPSERT' ||
      event === 'MESSAGES.UPSERT'

    if (!isMessageEvent) {
      return NextResponse.json({ received: true })
    }

    // Handle both array and object data formats
    const rawData = body.data
    const msgs: any[] = Array.isArray(rawData) ? rawData : rawData ? [rawData] : []

    for (const data of msgs) {
      if (!data || data.key?.fromMe) continue

      const remoteJid: string = data.key?.remoteJid || ''
      if (!remoteJid || remoteJid.includes('@g.us')) continue

      const phone = phoneFromJid(remoteJid)
      const content: string =
        data.message?.conversation ||
        data.message?.extendedTextMessage?.text ||
        data.message?.imageMessage?.caption ||
        data.message?.videoMessage?.caption ||
        data.message?.buttonsResponseMessage?.selectedDisplayText ||
        data.message?.listResponseMessage?.title ||
        ''

      if (!content) continue

      const pushName: string = data.pushName || ''
      const whatsappMessageId: string = data.key?.id || ''

      // Skip duplicate
      if (whatsappMessageId) {
        const { count } = await getSupabaseAdmin()
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('whatsapp_message_id', whatsappMessageId)
        if ((count ?? 0) > 0) continue
      }

      // Upsert contact
      let contactId: string | null = null
      const { data: existing } = await getSupabaseAdmin()
        .from('contacts')
        .select('id')
        .eq('phone', phone)
        .maybeSingle()

      if (existing) {
        contactId = existing.id
        if (pushName) {
          await getSupabaseAdmin().from('contacts').update({ name: pushName }).eq('id', contactId).is('name', null)
        }
      } else {
        const { data: newContact } = await getSupabaseAdmin()
          .from('contacts')
          .insert({ phone, name: pushName || null })
          .select('id')
          .single()
        contactId = newContact?.id ?? null
      }

      if (!contactId) continue

      // Find or create open ticket
      const { data: openTicket } = await getSupabaseAdmin()
        .from('tickets')
        .select('id, unread_count, assigned_agent_id')
        .eq('contact_id', contactId)
        .neq('status', 'finished')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      let ticketId: string
      let assignedAgentId: string | null = null
      const now = new Date().toISOString()

      if (openTicket) {
        ticketId = openTicket.id
        assignedAgentId = openTicket.assigned_agent_id ?? null
        await getSupabaseAdmin()
          .from('tickets')
          .update({ unread_count: (openTicket.unread_count || 0) + 1, last_message_at: now })
          .eq('id', ticketId)
      } else {
        const { data: newTicket } = await getSupabaseAdmin()
          .from('tickets')
          .insert({ contact_id: contactId, status: 'in_progress', unread_count: 1, last_message_at: now })
          .select('id')
          .single()
        if (!newTicket) continue
        ticketId = newTicket.id
      }

      await getSupabaseAdmin().from('messages').insert({
        ticket_id: ticketId,
        contact_id: contactId,
        sender_type: 'contact',
        content,
        whatsapp_message_id: whatsappMessageId || null,
      })

      // Notify assigned agent about new message
      if (assignedAgentId) {
        const contactName = pushName || phone
        await getSupabaseAdmin().from('notifications').insert({
          user_id: assignedAgentId,
          type: 'new_message',
          title: `Nova mensagem de ${contactName}`,
          body: content.length > 80 ? content.slice(0, 80) + '...' : content,
          ticket_id: ticketId,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ received: true })
  }
}
