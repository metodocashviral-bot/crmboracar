import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import DashboardClient from './DashboardClient'

const getCachedSettings = unstable_cache(
  async () => {
    const admin = getSupabaseAdmin()
    const { data } = await admin.from('company_settings').select('*').limit(1).single()
    return data
  },
  ['company_settings'],
  { revalidate: 60 }
)

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, settings] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getCachedSettings(),
  ])

  return (
    <DashboardClient profile={profile} settings={settings}>
      {children}
    </DashboardClient>
  )
}
