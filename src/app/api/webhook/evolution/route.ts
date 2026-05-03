import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { phoneFromJid } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.event !== 'MESSAGES_UPSERT') {
      return NextResponse.json({ received: true })
    }

    const data = body.data
    if (!data || data.key?.fromMe) {
      return NextResponse.json({ received: true })
    }

    const remoteJid: string = data.key?.remoteJid || ''
    if (!remoteJid || remoteJid.includes('@g.us')) {
      return NextResponse.json({ received: true })
    }

    const phone = phoneFromJid(remoteJid)
    const content: string =
      data.message?.conversation ||
      data.message?.extendedTextMessage?.text ||
      data.message?.imageMessage?.caption ||
      '[Mídia]'
    const pushName: string = data.pushName || ''
    const whatsappMessageId: string = data.key?.id || ''

    // Upsert contact
    let contactId: string | null = null
    const { data: existing } = await getSupabaseAdmin()
      .from('contacts')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    if (existing) {
      contactId = (existing as { id: string }).id
    } else {
      const { data: newContact } = await getSupabaseAdmin()
        .from('contacts')
        .insert({ phone, name: pushName || null })
        .select('id')
        .single()
      contactId = newContact ? (newContact as { id: string }).id : null
    }

    if (!contactId) return NextResponse.json({ received: true })

    // Find or create open ticket
    const { data: openTicket } = await getSupabaseAdmin()
      .from('tickets')
      .select('id, unread_count')
      .eq('contact_id', contactId)
      .neq('status', 'finished')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let ticketId: string
    if (openTicket) {
      ticketId = openTicket.id
      await getSupabaseAdmin()
        .from('tickets')
        .update({
          unread_count: (openTicket.unread_count || 0) + 1,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
    } else {
      const { data: newTicket } = await getSupabaseAdmin()
        .from('tickets')
        .insert({
          contact_id: contactId,
          status: 'in_progress',
          unread_count: 1,
          last_message_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      ticketId = newTicket!.id
    }

    // Save message (avoid duplicate)
    if (whatsappMessageId) {
      const { count } = await getSupabaseAdmin()
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('whatsapp_message_id', whatsappMessageId)
      if ((count ?? 0) > 0) return NextResponse.json({ received: true })
    }

    await getSupabaseAdmin().from('messages').insert({
      ticket_id: ticketId,
      contact_id: contactId,
      sender_type: 'contact',
      content,
      whatsapp_message_id: whatsappMessageId || null,
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ received: true })
  }
}
