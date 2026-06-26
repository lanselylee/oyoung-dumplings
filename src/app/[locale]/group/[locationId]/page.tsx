import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GroupPageClient from '@/components/group/GroupPageClient'

export default async function GroupPage({
  params,
}: {
  params: Promise<{ locale: string; locationId: string }>
}) {
  const { locale, locationId } = await params
  const supabase = await createClient()

  const { data: location } = await supabase
    .from('pickup_locations')
    .select('*')
    .eq('id', locationId)
    .single()

  if (!location) notFound()

  const { data: group } = await supabase
    .from('group_orders')
    .select('*')
    .eq('pickup_location_id', locationId)
    .eq('status', 'open')
    .maybeSingle()

  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('sort_order')

  const { data: tiers } = await supabase
    .from('discount_tiers')
    .select('*')
    .order('min_people')

  return (
    <GroupPageClient
      locale={locale}
      location={location}
      group={group}
      items={items ?? []}
      tiers={tiers ?? []}
    />
  )
}
