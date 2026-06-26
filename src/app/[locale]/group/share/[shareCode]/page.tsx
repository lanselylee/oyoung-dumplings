import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function ShareCodePage({
  params,
}: {
  params: Promise<{ locale: string; shareCode: string }>
}) {
  const { locale, shareCode } = await params
  const supabase = await createClient()

  const { data: group } = await supabase
    .from('group_orders')
    .select('pickup_location_id, status')
    .eq('share_code', shareCode)
    .single()

  if (!group) notFound()
  if (group.status !== 'open') redirect(`/${locale}`)

  redirect(`/${locale}/group/${group.pickup_location_id}`)
}
