import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { sendMediaMessage, sendAudioMessage } from '@/lib/evolution/api'

async function ensureMediaBucket(admin: ReturnType<typeof getSupabaseAdmin>) {
  const { data: buckets } = await admin.storage.listBuckets()
  if (!buckets?.some((b) => b.name === 'chat-media')) {
    await admin.storage.createBucket('chat-media', { public: true, fileSizeLimit: 20971520 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const ticketId = formData.get('ticketId') as string
  const agentId = formData.get('agentId') as string
  const caption = (formData.get('caption') as string) || ''
  const mediaType = (formData.get('mediaType') as string) || 'document'

  if (!file || !ticketId) return NextResponse.json({ error: 'file and ticketId required' }, { status: 400 })

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  if (!evolutionUrl || !evolutionKey) return NextResponse.json({ error: 'Evolution API não configurada' }, { status: 500 })

  const admin = getSupabaseAdmin()

  const [{ data: ticket }, { data: settings }, { data: agentProfile }] = await Promise.all([
    admin.from('tickets').select('*, contact:contacts(*)').eq('id', ticketId).single(),
    admin.from('company_settings').select('evolution_instance').limit(1).single(),
    admin.from('profiles').select('full_name').eq('id', agentId || user.id).single(),
  ])

  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  if (!settings?.evolution_instance) return NextResponse.json({ error: 'WhatsApp não conectado' }, { status: 400 })

  const agentName = agentProfile?.full_name || ''

  await ensureMediaBucket(admin)

  const ext = file.name.split('.').pop() || 'bin'
  const path = `${ticketId}/${Date.now()}-${file.name}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await admin.storage.from('chat-media').upload(path, buffer, { contentType: file.type, upsert: false })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: urlData } = admin.storage.from('chat-media').getPublicUrl(path)
  const mediaUrl = urlData.publicUrl

  const cfg = { url: evolutionUrl, apiKey: evolutionKey, instance: settings.evolution_instance }
  const phone = ticket.contact.phone

  try {
    if (mediaType === 'audio') {
      await sendAudioMessage(phone, mediaUrl, cfg)
    } else {
      const captionWithName = agentName ? `*${agentName}:*\n${caption}` : caption
      await sendMediaMessage(phone, {
        type: mediaType as 'image' | 'video' | 'document',
        url: mediaUrl,
        filename: file.name,
        caption: captionWithName,
      }, cfg)
    }
  } catch (err: any) {
    return NextResponse.json({ error: `Evolution API: ${err.message}` }, { status: 500 })
  }

  const { data: message } = await admin.from('messages').insert({
    ticket_id: ticketId,
    contact_id: ticket.contact_id,
    sender_type: 'agent',
    agent_id: agentId || user.id,
    content: caption || file.name,
    media_url: mediaUrl,
    media_type: mediaType,
  }).select('*, agent:profiles(id, full_name)').single()

  await admin.from('tickets').update({ last_message_at: new Date().toISOString() }).eq('id', ticketId)

  return NextResponse.json({ message })
}
