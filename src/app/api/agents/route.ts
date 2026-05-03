import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('*')
    .order('full_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ agents: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { full_name, email, password } = await req.json()
  if (!full_name || !email || !password) {
    return NextResponse.json({ error: 'full_name, email and password required' }, { status: 400 })
  }

  const { data: authUser, error: authError } = await getSupabaseAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Use upsert — a DB trigger may have already created the profile row on auth.users insert
  const { data: newProfile, error: profileError } = await getSupabaseAdmin()
    .from('profiles')
    .upsert({ id: authUser.user.id, full_name, email, role: 'agent', is_active: true }, { onConflict: 'id' })
    .select()
    .single()

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ agent: newProfile })
}
