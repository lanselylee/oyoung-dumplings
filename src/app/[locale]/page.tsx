import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/server'
import LocationCard from '@/components/group/LocationCard'
import type { GroupOrder, PickupLocation } from '@/types'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: locations } = await supabase
    .from('pickup_locations')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const { data: activeGroups } = await supabase
    .from('group_orders')
    .select('*, pickup_location:pickup_locations(*)')
    .eq('status', 'open')

  const groupsByLocation: Record<string, GroupOrder> = {}
  activeGroups?.forEach(g => {
    groupsByLocation[g.pickup_location_id] = g
  })

  return <HomePageClient locale={locale} locations={locations ?? []} groupsByLocation={groupsByLocation} />
}

function HomePageClient({
  locale,
  locations,
  groupsByLocation,
}: {
  locale: string
  locations: PickupLocation[]
  groupsByLocation: Record<string, GroupOrder>
}) {
  'use client'
  const t = useTranslations()

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#D92B2B] mb-2">{t('home.title')}</h1>
        <p className="text-[#6B6B6B]">{t('home.subtitle')}</p>
      </div>

      <h2 className="text-xl font-bold mb-4">{t('home.selectLocation')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map(loc => (
          <LocationCard
            key={loc.id}
            location={loc}
            group={groupsByLocation[loc.id] ?? null}
            locale={locale}
          />
        ))}
      </div>
    </div>
  )
}
