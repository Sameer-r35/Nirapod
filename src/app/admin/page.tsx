import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminClient } from './admin-client'

const ADMIN_PHONE = process.env.ADMIN_PHONE ?? ''

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // only your number can access admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('phone')
    .eq('id', user.id)
    .single()

  if (!profile || profile.phone !== ADMIN_PHONE) redirect('/')

  // fetch pending reports with entity info
  const { data: reports } = await supabase
    .from('incident_reports')
    .select(`
      *,
      entities (canonical_id, fb_url, trust_score)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return <AdminClient reports={reports ?? []} />
}