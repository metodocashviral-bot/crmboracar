import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

async function ensureBucket(admin: ReturnType<typeof getSupabaseAdmin>) {
  const { data: buckets } = await admin.storage.listBuckets()
  const exists = buckets?.some((b) => b.name === 'logos')
  if (!exists) {
    await admin.storage.createBucket('logos', { public: true, fileSizeLimit: 5242880 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const settingsId = formData.get('settingsId') as string | null

  if (!file || !settingsId) {
    return NextResponse.json({ error: 'file and settingsId required' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'png'
  const path = `${settingsId}-${Date.now()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const admin = getSupabaseAdmin()

  await ensureBucket(admin)

  const { error: uploadError } = await admin.storage
    .from('logos')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from('logos').getPublicUrl(path)

  const { data, error } = await admin
    .from('company_settings')
    .update({ logo_url: urlData.publicUrl })
    .eq('id', settingsId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ settings: data })
}
